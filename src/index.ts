/**
 * dsh-workspace-files Host 入口 —— 一个静态 Cordis 插件。
 *
 * 职责（Host 拥有）：
 * - 把当前会话工作区的单层列表 / 全工作区搜索 / 只读预览暴露为
 *   同源 HTTP 路由（浏览器端通过 contract.ts 中的路由调用）；
 * - 所有副作用 Fiber 归属（ctx.effect 包裹路由注册），卸载时自动移除。
 */
import type { Context } from '@deepseek-ai/cordis'
import { ROUTE_DIR, ROUTE_LIST, ROUTE_READ, ROUTE_SEARCH } from './contract.js'
import { listLevel, readPreview, searchWorkspace } from './host/files.js'
import { resolveRoot } from './host/workspace.js'
import type { WebRequest, WebResponse } from './host/services.js'

export const name = 'dsh-workspace-files'

export const inject = ['fs', 'agents', 'webServer']

function json(res: WebResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

function params(req: WebRequest): URLSearchParams {
  return new URL(req.url ?? '/', 'http://localhost').searchParams
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export function apply(ctx: Context): void {
  // GET /dsh-workspace-files/list?session=<id> → 根目录一层
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: ROUTE_LIST,
    handler: async (req, res) => {
      try {
        const sessionId = params(req).get('session') ?? ''
        const resolved = await resolveRoot(ctx, sessionId)
        if ('error' in resolved) return json(res, 200, { ok: false, error: resolved.error })
        const info = await ctx.fs.stat(resolved.root)
        if (info === undefined) return json(res, 200, { ok: false, error: 'NOT_FOUND' })
        if (info.type !== 'directory') return json(res, 200, { ok: false, error: 'NOT_A_DIRECTORY' })
        const entries = await listLevel(ctx, resolved.root, '')
        json(res, 200, { ok: true, root: resolved.rootPath, entries })
      } catch (error) {
        json(res, 200, { ok: false, error: 'LIST_FAILED', message: errorMessage(error) })
      }
    },
  }))

  // GET /dsh-workspace-files/dir?session=<id>&path=<rel> → 单层目录
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: ROUTE_DIR,
    handler: async (req, res) => {
      try {
        const query = params(req)
        const sessionId = query.get('session') ?? ''
        const rel = query.get('path') ?? ''
        if (rel === '') return json(res, 200, { ok: false, error: 'INVALID_PATH' })
        const resolved = await resolveRoot(ctx, sessionId)
        if ('error' in resolved) return json(res, 200, { ok: false, error: resolved.error })
        const target = await ctx.fs.resolve(rel, { cwd: resolved.rootPath })
        if (!ctx.fs.contains(resolved.root, target)) return json(res, 200, { ok: false, error: 'OUT_OF_BOUNDS' })
        const info = await ctx.fs.stat(target)
        if (info === undefined) return json(res, 200, { ok: false, error: 'NOT_FOUND' })
        if (info.type !== 'directory') return json(res, 200, { ok: false, error: 'NOT_A_DIRECTORY' })
        json(res, 200, { ok: true, entries: await listLevel(ctx, target, rel) })
      } catch (error) {
        json(res, 200, { ok: false, error: 'LIST_FAILED', message: errorMessage(error) })
      }
    },
  }))

  // GET /dsh-workspace-files/search?session=<id>&q=<query> → 有界全工作区搜索
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: ROUTE_SEARCH,
    handler: async (req, res) => {
      try {
        const query = params(req)
        const sessionId = query.get('session') ?? ''
        const q = (query.get('q') ?? '').trim().toLowerCase()
        if (q === '') return json(res, 200, { ok: true, matches: [], truncated: false })
        const resolved = await resolveRoot(ctx, sessionId)
        if ('error' in resolved) return json(res, 200, { ok: false, error: resolved.error })
        const result = await searchWorkspace(ctx, resolved.root, q)
        json(res, 200, { ok: true, ...result })
      } catch (error) {
        json(res, 200, { ok: false, error: 'SEARCH_FAILED', message: errorMessage(error) })
      }
    },
  }))

  // GET /dsh-workspace-files/read?session=<id>&path=<rel> → 有界只读预览
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: ROUTE_READ,
    handler: async (req, res) => {
      try {
        const query = params(req)
        const sessionId = query.get('session') ?? ''
        const rel = query.get('path') ?? ''
        if (rel === '') return json(res, 200, { ok: false, error: 'INVALID_PATH' })
        const resolved = await resolveRoot(ctx, sessionId)
        if ('error' in resolved) return json(res, 200, { ok: false, error: resolved.error })
        const target = await ctx.fs.resolve(rel, { cwd: resolved.rootPath })
        if (!ctx.fs.contains(resolved.root, target)) return json(res, 200, { ok: false, error: 'OUT_OF_BOUNDS' })
        const info = await ctx.fs.stat(target)
        if (info === undefined) return json(res, 200, { ok: false, error: 'NOT_FOUND' })
        if (info.type !== 'file') return json(res, 200, { ok: false, error: 'NOT_A_FILE' })
        const size = typeof info.size === 'number' ? info.size : 0
        const result = await readPreview(ctx, target, rel, size)
        json(res, 200, { ok: true, ...result })
      } catch (error) {
        json(res, 200, { ok: false, error: 'READ_FAILED', message: errorMessage(error) })
      }
    },
  }))
}
