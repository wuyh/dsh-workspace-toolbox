/**
 * Docker 连接管理器：
 * - local：本机 unix socket，无需凭据；
 * - ssh：通过 ssh-tunnel 连接远程 docker socket，复用 ssh 密码/密钥；
 * - 连接元数据（不含任何秘密）持久化到 ~/.dsh/storages 下的 JSON 文件，
 *   密码/私钥口令只保存在运行时内存中，重启后需重新输入。
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { homedir } from 'node:os'
import { randomUUID } from 'node:crypto'
import type { Client } from 'ssh2'
import { docker, type DockerBackend } from './engine.js'
import { connectSsh } from './ssh-tunnel.js'

export interface DockerConnectionSpec {
  id: string
  kind: 'local' | 'ssh'
  name: string
  host?: string
  port?: number
  username?: string
  /** 认证方式；密码不落盘，仅运行时内存。 */
  authKind?: 'password' | 'key'
  keyPath?: string
}

export interface DockerConnectionView {
  id: string
  kind: 'local' | 'ssh'
  name: string
  host?: string
  port?: number
  username?: string
  authKind?: 'password' | 'key'
  keyPath?: string
  connected: boolean
  engine?: { version?: string; apiVersion?: string }
  error?: string
}

interface RuntimeConnection {
  spec: DockerConnectionSpec
  backend: DockerBackend
  sshClient?: Client
  version?: string
  apiVersion?: string
}

const STORE_PATH = join(homedir(), '.dsh', 'storages', 'dsh-workspace-toolbox', 'docker-connections.json')

const runtime = new Map<string, RuntimeConnection>()

function loadMetadata(): DockerConnectionSpec[] {
  try {
    const parsed = JSON.parse(readFileSync(STORE_PATH, 'utf8')) as unknown
    if (Array.isArray(parsed)) return parsed as DockerConnectionSpec[]
  } catch {
    // 首次运行或文件损坏
  }
  return []
}

function saveMetadata(specs: DockerConnectionSpec[]): void {
  try {
    mkdirSync(dirname(STORE_PATH), { recursive: true })
    writeFileSync(STORE_PATH, JSON.stringify(specs, null, 2))
  } catch {
    // 持久化失败不影响本次会话
  }
}

/** 生成可读的连接 id（ssh 连接带随机后缀）。 */
function newId(kind: 'local' | 'ssh'): string {
  return kind === 'local' ? 'local' : 'ssh-' + randomUUID().slice(0, 8)
}

export function listConnections(): DockerConnectionView[] {
  const specs = loadMetadata()
  if (!specs.some((s) => s.id === 'local')) {
    specs.unshift({ id: 'local', kind: 'local', name: '本机 Docker (local)' })
  }
  return specs.map((spec) => {
    const entry = runtime.get(spec.id)
    return {
      ...spec,
      connected: entry !== undefined,
      engine: entry !== undefined ? { version: entry.version, apiVersion: entry.apiVersion } : undefined,
    }
  })
}

/** 连接并校验可达性；成功返回连接视图，失败抛出带消息的错误。 */
export async function connect(spec: DockerConnectionSpec): Promise<DockerConnectionView> {
  if (spec.kind === 'local') {
    const backend: DockerBackend = { kind: 'local' }
    try {
      const info = await docker.version(backend)
      runtime.set('local', { spec: { ...spec, id: 'local' }, backend, version: info.Version, apiVersion: info.ApiVersion })
    } catch (error) {
      throw new Error('无法连接本机 Docker：' + messageOf(error))
    }
  } else {
    const host = spec.host?.trim() ?? ''
    const port = typeof spec.port === 'number' ? spec.port : 22
    const username = spec.username?.trim() ?? ''
    if (host === '' || username === '') throw new Error('请填写 SSH 主机与用户名')
    if (spec.authKind === 'password' && (spec as DockerConnectionSpec & { password?: string }).password === undefined) {
      throw new Error('请填写 SSH 密码')
    }
    if (spec.authKind === 'key' && (spec.keyPath === undefined || spec.keyPath.trim() === '')) {
      throw new Error('请填写私钥文件路径')
    }
    const conn = await connectSsh(
      { host, port, username },
      spec.authKind === 'password'
        ? { kind: 'password', password: (spec as DockerConnectionSpec & { password?: string }).password }
        : { kind: 'key', keyPath: spec.keyPath, passphrase: (spec as DockerConnectionSpec & { passphrase?: string }).passphrase },
    )
    const backend: DockerBackend = { kind: 'ssh', conn }
    try {
      const info = await docker.version(backend)
      runtime.set(spec.id, { spec, backend, sshClient: conn, version: info.Version, apiVersion: info.ApiVersion })
    } catch (error) {
      conn.end()
      throw new Error('SSH 已连接，但远程 docker socket 不可达：' + messageOf(error))
    }
  }
  const specs = loadMetadata().filter((s) => s.id !== spec.id)
  specs.push(withoutSecrets(spec))
  saveMetadata(specs)
  return {
    ...withoutSecrets(spec),
    connected: true,
    engine: (() => { const e = runtime.get(spec.id); return e !== undefined ? { version: e.version, apiVersion: e.apiVersion } : undefined })(),
  }
}

/** 断开并（可选）删除元数据。 */
export function disconnect(id: string, forget = false): void {
  const entry = runtime.get(id)
  if (entry !== undefined && entry.sshClient !== undefined) entry.sshClient.end()
  runtime.delete(id)
  if (forget) {
    const specs = loadMetadata().filter((s) => s.id !== id)
    saveMetadata(specs)
  }
}

/** 取得连接对应的后端；未连接时抛错。 */
export function backendOf(id: string): DockerBackend {
  const entry = runtime.get(id)
  if (entry === undefined) throw new Error('连接未建立，请先连接')
  return entry.backend
}

function withoutSecrets(spec: DockerConnectionSpec): DockerConnectionSpec {
  const copy: DockerConnectionSpec = { id: spec.id, kind: spec.kind, name: spec.name }
  if (spec.kind === 'ssh') {
    copy.host = spec.host
    copy.port = spec.port
    copy.username = spec.username
    copy.authKind = spec.authKind
    copy.keyPath = spec.keyPath
  }
  return copy
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
