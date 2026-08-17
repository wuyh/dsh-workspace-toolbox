/**
 * SSH 隧道：复用 ssh 账号密码/密钥连接服务器，并把远程的
 * `/var/run/docker.sock` 以 OpenSSH stream-local 通道转发成本地可用的
 * 双工流 —— 不改动服务器 docker 配置（与 IDEA 远程 Docker 的做法一致）。
 */
import { readFileSync } from 'node:fs'
import { Duplex } from 'node:stream'
import { Client, type Channel } from 'ssh2'

export interface SshAuth {
  kind: 'password' | 'key'
  password?: string
  /** 本机私钥文件路径（如 ~/.ssh/id_ed25519）。 */
  keyPath?: string
  passphrase?: string
}

export interface SshTarget {
  host: string
  port: number
  username: string
}

/** 连接 SSH（密码或私钥认证），就绪后返回 Client。 */
export function connectSsh(target: SshTarget, auth: SshAuth): Promise<Client> {
  return new Promise((resolve, reject) => {
    const client = new Client()
    const onReady = (): void => { cleanup(); resolve(client) }
    const onError = (error: Error): void => { cleanup(); reject(error) }
    const cleanup = (): void => {
      client.removeListener('ready', onReady)
      client.removeListener('error', onError)
    }
    client.once('ready', onReady)
    client.once('error', onError)
    const base = { host: target.host, port: target.port, username: target.username }
    if (auth.kind === 'password') {
      client.connect({ ...base, password: auth.password ?? '' })
    } else {
      const privateKey = readFileSync(auth.keyPath ?? '', 'utf8')
      client.connect({ ...base, privateKey, passphrase: auth.passphrase })
    }
  })
}

/**
 * 以双工流形式打开一条指向远程 docker socket 的通道：
 * Node 的 http 客户端可以把它当作自定义连接使用（HTTP 解析交给 Node）。
 */
export function dockerSocket(conn: Client, socketPath = '/var/run/docker.sock'): Duplex {
  const socket = new Duplex({
    read() {},
    write(chunk, _encoding, cb) {
      if (channel !== null) channel.write(chunk, cb)
      else pending.push({ chunk, cb })
    },
    final(cb) {
      if (channel !== null) channel.end()
      cb()
    },
  })
  let channel: Channel | null = null
  const pending: Array<{ chunk: Buffer | string, cb: (err?: Error | null) => void }> = []
  conn.openssh_forwardOutStreamLocal(socketPath, (err, ch) => {
    if (err) {
      socket.destroy(err)
      return
    }
    channel = ch
    ch.on('data', (d: Buffer) => { socket.push(d) })
    ch.on('end', () => { socket.push(null) })
    ch.on('close', () => { socket.push(null) })
    ch.on('error', (e: Error) => { socket.destroy(e) })
    for (const w of pending) ch.write(w.chunk, w.cb)
    pending.length = 0
    socket.emit('connect')
  })
  const socketLike = socket as unknown as Duplex & {
    setTimeout(ms?: number): unknown
    setNoDelay(noDelay?: boolean): unknown
  }
  socketLike.setTimeout = () => socketLike
  socketLike.setNoDelay = () => socketLike
  return socketLike
}
