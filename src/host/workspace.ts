/**
 * 会话工作区根目录的解析。
 *
 * 优先级与 dsh-tool-fs 的 session-cwd 约定一致，保证文件视图展示的
 * 目录就是模型工具实际操作的目录：
 *   1. 会话 Agent 的 header.cwd；
 *   2. 会话记录（in-memory sessions）的 header.cwd；
 *   3. 沙箱策略的 workspaceRoot 兜底。
 */
import type { Context } from '@deepseek-ai/cordis'
import type { FsTarget } from './services.js'

export interface ResolvedRoot {
  rootPath: string
  root: FsTarget
}

export interface RootError {
  error: string
}

export async function resolveRoot(ctx: Context, sessionId: string): Promise<ResolvedRoot | RootError> {
  let rootPath = ''
  const agent = ctx.agents.get(sessionId)
  if (agent && typeof agent.session.header.cwd === 'string') {
    rootPath = agent.session.header.cwd
  }
  if (rootPath === '') {
    const session = ctx.sessions?.get(sessionId)
    if (session && typeof session.header.cwd === 'string') rootPath = session.header.cwd
  }
  if (rootPath === '') {
    const policy = ctx.sandboxPolicy
    if (policy !== undefined && typeof policy.workspaceRoot === 'string') rootPath = policy.workspaceRoot
  }
  if (rootPath === '') return { error: 'NO_WORKSPACE' }
  try {
    return { rootPath, root: await ctx.fs.resolve(rootPath) }
  } catch {
    return { error: 'NOT_FOUND' }
  }
}
