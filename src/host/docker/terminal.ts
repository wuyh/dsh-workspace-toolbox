/**
 * Docker 面板的终端：通过 WebSocket 把浏览器端 xterm 接到 SSH shell 通道
 * （ssh2，带 PTY）、本地 shell（cmd / sh），或某个容器内的 shell
 * （docker exec，带 PTY）。
 *
 * 协议（浏览器 → Host 的 ws 文本消息）：
 * - 以 \u0000 开头的控制消息：`\u0000init{"cols":..,"rows":..}`（首帧尺寸）、
 *   `\u0000resize{"cols":..,"rows":..}`（尺寸变化）；
 * - 其余文本原样写入通道（键盘输入）。
 * Host → 浏览器：通道输出的原始字节流。
 */
import { spawn } from 'node:child_process'
import type { IncomingMessage } from 'node:http'
import type { Duplex } from 'node:stream'
import type { Context } from '@deepseek-ai/cordis'
import type { Channel } from 'ssh2'
import { WebSocket, WebSocketServer } from 'ws'
import { docker, execStream } from './engine.js'
import { backendOf } from './manager.js'

const TERMINAL_PATH = '/dsh-workspace-toolbox/docker/terminal'
const CONTROL_PREFIX = '\u0000'

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

interface ControlMessage {
  kind: 'init' | 'resize'
  cols: number
  rows: number
}

/** 解析 \u0000 控制消息；普通输入返回 null。 */
function parseControl(data: string): ControlMessage | null {
  if (!data.startsWith(CONTROL_PREFIX)) return null
  const body = data.slice(CONTROL_PREFIX.length)
  for (const kind of ['init', 'resize'] as const) {
    if (body.startsWith(kind)) {
      try {
        const parsed = JSON.parse(body.slice(kind.length)) as { cols?: unknown, rows?: unknown }
        const cols = clamp(Math.floor(Number(parsed.cols) || 80), 2, 500)
        const rows = clamp(Math.floor(Number(parsed.rows) || 24), 2, 200)
        return { kind, cols, rows }
      } catch {
        return null
      }
    }
  }
  return null
}

/**
 * 双向接线：通道输出 → ws；ws 输入 → 通道；关闭/错误互相收敛。
 * setSize 用于 SSH 通道的 PTY 尺寸同步（本地 shell 无 PTY，不传）。
 */
function pipeStream(ws: WebSocket, stream: NodeJS.ReadWriteStream, setSize?: (rows: number, cols: number) => void): void {
  let settled = false
  const settle = (): void => {
    if (settled) return
    settled = true
    try { ws.close() } catch { /* 已关闭 */ }
  }
  stream.on('data', (d: unknown) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(d as Buffer)
  })
  stream.on('close', settle)
  stream.on('end', settle)
  stream.on('error', settle)
  ws.on('message', (data: unknown) => {
    const text = Buffer.isBuffer(data) ? data.toString('utf8') : String(data)
    const ctrl = parseControl(text)
    if (ctrl !== null) {
      if (ctrl.kind === 'resize' && setSize !== undefined) {
        try { setSize(ctrl.rows, ctrl.cols) } catch { /* 通道可能已关闭 */ }
      }
      return
    }
    try { stream.write(text) } catch { /* 通道可能已关闭 */ }
  })
  ws.on('close', () => {
    try { stream.end() } catch { /* 已结束 */ }
  })
  ws.on('error', settle)
}

export function registerTerminalUpgrade(ctx: Context): void {
  const wss = new WebSocketServer({ noServer: true })
  ctx.effect(() => ctx.webServer.registerUpgrade({
    path: TERMINAL_PATH,
    handler: (req: IncomingMessage, socket: Duplex, head: Buffer) => {
      wss.handleUpgrade(req, socket, head, (ws) => {
        const u = new URL(req.url ?? '/', 'http://localhost')
        const id = u.searchParams.get('connection') ?? 'local'
        const container = u.searchParams.get('container') ?? ''
        let backend
        try {
          backend = backendOf(id)
        } catch (error) {
          ws.close(1008, '连接未建立：' + messageOf(error).slice(0, 120))
          return
        }
        if (container !== '') {
          // 进入容器：docker exec（带 PTY 的 shell）。
          void handleContainerTerminal(ws, backend, container)
          return
        }
        if (backend.kind === 'ssh') {
          // SSH shell 通道（服务器提供 PTY）。
          backend.conn.shell({ term: 'xterm-256color', cols: 80, rows: 24 }, (err, stream) => {
            if (err !== undefined && err !== null) {
              ws.close(1011, '打开 SSH shell 失败：' + messageOf(err).slice(0, 120))
              return
            }
            const channel = stream as Channel
            pipeStream(ws, channel, (rows, cols) => {
              try { channel.setWindow(rows, cols, rows, cols) } catch { /* 忽略 */ }
            })
          })
        } else {
          // 本地 shell（管道模式，无 PTY：基本命令可用，交互式程序受限）。
          const shellPath = process.platform === 'win32'
            ? (process.env.ComSpec ?? 'C:\\Windows\\System32\\cmd.exe')
            : '/bin/sh'
          let child
          try {
            child = spawn(shellPath, [], { stdio: ['pipe', 'pipe', 'pipe'] })
          } catch (error) {
            ws.close(1011, '启动本地 shell 失败：' + messageOf(error).slice(0, 120))
            return
          }
          pipeChild(ws, child)
        }
      })
    },
  }))
  ctx.effect(() => () => { wss.close() })
}

/** 本地 shell 接线：stdout+stderr → ws，ws 输入 → stdin（无 PTY，忽略 resize）。 */
function pipeChild(ws: WebSocket, child: import('node:child_process').ChildProcessWithoutNullStreams): void {
  let settled = false
  const settle = (): void => {
    if (settled) return
    settled = true
    try { ws.close() } catch { /* 已关闭 */ }
  }
  const onData = (d: Buffer): void => {
    if (ws.readyState === WebSocket.OPEN) ws.send(d)
  }
  child.stdout.on('data', onData)
  child.stderr.on('data', onData)
  child.on('close', settle)
  child.on('error', settle)
  ws.on('message', (data: unknown) => {
    const text = Buffer.isBuffer(data) ? data.toString('utf8') : String(data)
    if (parseControl(text) !== null) return
    try { child.stdin.write(text) } catch { /* stdin 可能已关闭 */ }
  })
  ws.on('close', () => {
    try { child.stdin.end() } catch { /* 已结束 */ }
  })
  ws.on('error', settle)
}

/**
 * 进入容器：docker exec 创建带 PTY 的 shell 并接线。
 * execStream 已越过响应头返回原始 socket：写 = stdin，读 = stdout+stderr。
 */
async function handleContainerTerminal(ws: WebSocket, backend: import('./engine.js').DockerBackend, container: string): Promise<void> {
  let execId: string
  try {
    const created = await docker.createExec(backend, container, ['sh'])
    execId = created.Id
  } catch (error) {
    ws.close(1011, '创建 exec 失败：' + messageOf(error).slice(0, 120))
    return
  }
  let io: import('./engine.js').ExecStreamHandle
  try {
    io = await execStream(backend, execId)
  } catch (error) {
    ws.close(1011, '启动 exec 失败：' + messageOf(error).slice(0, 120))
    return
  }
  const { socket, initial } = io
  let settled = false
  const settle = (): void => {
    if (settled) return
    settled = true
    try { ws.close() } catch { /* 已关闭 */ }
  }
  const onData = (d: Buffer): void => {
    if (ws.readyState === WebSocket.OPEN) ws.send(d)
  }
  if (initial.length > 0) onData(initial)
  socket.on('data', onData)
  socket.on('close', settle)
  socket.on('end', settle)
  socket.on('error', settle)
  ws.on('message', (data: unknown) => {
    const text = Buffer.isBuffer(data) ? data.toString('utf8') : String(data)
    const ctrl = parseControl(text)
    if (ctrl !== null) {
      if (ctrl.kind === 'resize') {
        docker.resizeExec(backend, execId, ctrl.rows, ctrl.cols).catch(() => {})
      }
      return
    }
    try { socket.write(text) } catch { /* 已关闭 */ }
  })
  ws.on('close', () => {
    try { socket.end() } catch { /* 已结束 */ }
  })
  ws.on('error', settle)
}
