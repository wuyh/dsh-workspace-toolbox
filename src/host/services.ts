/**
 * Host 侧服务的最小类型面 + `@deepseek-ai/cordis` 的 Context 扩展。
 *
 * 这里只声明本插件实际使用的成员（与 rc.6 的真实服务签名一致），
 * 避免把整套 dsh-* 类型包变成硬依赖；插件也借此把“用到的能力”说清楚。
 */
import '@deepseek-ai/cordis'

/** `ctx.fs` 返回的稳定目标句柄（对调用方保持不透明）。 */
export interface FsTarget {
  targetKey: unknown
}

export interface FsInfo {
  type: 'file' | 'directory' | 'other'
  size?: number
}

export interface FsDirEntry {
  name: string
  type: 'file' | 'directory' | 'other'
  target: FsTarget
  size?: number
}

export interface FsService {
  resolve(path: string, opts?: { cwd?: string }): Promise<FsTarget>
  processPath(target: FsTarget): string
  contains(parent: FsTarget, child: FsTarget): boolean
  stat(target: FsTarget): Promise<FsInfo | undefined>
  listDir(target: FsTarget): Promise<FsDirEntry[]>
  readText(target: FsTarget): Promise<string>
  streamText(target: FsTarget): Promise<AsyncIterable<string>>
  readBytes(target: FsTarget, signal: undefined, maxBytes: number): Promise<Uint8Array>
}

export interface AgentHeader {
  cwd?: string
}

export interface Agent {
  session: {
    header: AgentHeader
  }
}

export interface AgentsService {
  get(id: string): Agent | undefined
}

export interface WebRequest {
  url?: string
}

export interface WebResponse {
  writeHead(status: number, headers: Record<string, string>): void
  end(body: string): void
}

export interface WebRoute {
  kind: 'exact'
  path: string
  handler: (req: WebRequest, res: WebResponse) => void | Promise<void>
}

export interface WebServerService {
  register(route: WebRoute): () => void
}

export interface SessionsService {
  get(id: string): { header: AgentHeader } | undefined
}

export interface SandboxPolicyService {
  workspaceRoot: string
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    fs: FsService
    agents: AgentsService
    webServer: WebServerService
    sessions?: SessionsService
    sandboxPolicy?: SandboxPolicyService
  }
}
