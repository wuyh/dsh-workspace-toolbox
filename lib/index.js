/**
 * dsh-workspace-files Host half — a static Cordis plugin.
 *
 * Responsibilities (Host-owned):
 * - serve the current session workspace's directory listing, one level per
 *   request, plus a bounded full-workspace name search;
 * - serve a bounded, containment-checked file read for the browser preview
 *   (plain text streamed up to a cap, images as base64 data URLs, binaries
 *   reported as metadata only);
 * - only relative paths + cheap metadata ever cross the wire.
 *
 * Every side effect is Fiber-owned (`ctx.effect` disposers), so stop/unload
 * removes the routes.
 */
const NAME = 'dsh-workspace-files'

const MAX_TEXT = 256 * 1024
const MAX_IMAGE_BYTES = 3 * 1024 * 1024
const MAX_SEARCH_MATCHES = 200
const MAX_SEARCH_VISIT = 6000
const MAX_SEARCH_DEPTH = 12

const IGNORED = new Set([
  '.git', '.svn', '.hg', '.dsh', 'node_modules', '__pycache__',
  '.venv', 'venv', '.tox', '.mypy_cache', '.pytest_cache', '.ruff_cache',
  '.cache', '.turbo', '.next', '.nuxt', '.pnpm', '.pnpm-store', '.yarn',
  '.idea', '.vscode', '.DS_Store', 'desktop.ini', 'thumbs.db',
])

const IMAGE_MIME = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
  webp: 'image/webp', bmp: 'image/bmp', ico: 'image/x-icon', avif: 'image/avif',
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function bytesToBase64(bytes) {
  let out = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0
    out += B64[b0 >> 2]
    out += B64[((b0 & 3) << 4) | (b1 >> 4)]
    out += i + 1 < bytes.length ? B64[((b1 & 15) << 2) | (b2 >> 6)] : '='
    out += i + 2 < bytes.length ? B64[b2 & 63] : '='
  }
  return out
}

function absPath(ctx, target) {
  try {
    return ctx.fs.processPath(target)
  } catch {
    return undefined
  }
}

/**
 * Resolve the session workspace root: agent header cwd → session header cwd →
 * the sandbox policy's workspace root. Mirrors dsh-tool-fs's session-cwd
 * convention so the file view never acts on the server's launch directory.
 */
async function resolveRoot(ctx, sessionId) {
  let rootPath = ''
  const agent = ctx.agents.get(sessionId)
  if (agent && agent.session && agent.session.header && typeof agent.session.header.cwd === 'string') {
    rootPath = agent.session.header.cwd
  }
  if (rootPath === '') {
    const sessions = ctx.get('sessions')
    const session = sessions === undefined ? undefined : sessions.get(sessionId)
    if (session && session.header && typeof session.header.cwd === 'string') rootPath = session.header.cwd
  }
  if (rootPath === '') {
    const policy = ctx.get('sandboxPolicy')
    if (policy !== undefined && typeof policy.workspaceRoot === 'string') rootPath = policy.workspaceRoot
  }
  if (rootPath === '') return { error: 'NO_WORKSPACE' }
  try {
    return { rootPath, root: await ctx.fs.resolve(rootPath) }
  } catch {
    return { error: 'NOT_FOUND' }
  }
}

async function listLevel(ctx, target, rel) {
  let entries
  try {
    entries = await ctx.fs.listDir(target)
  } catch {
    return []
  }
  const out = []
  for (const entry of entries) {
    if (IGNORED.has(entry.name)) continue
    const childRel = rel === '' ? entry.name : rel + '/' + entry.name
    const isDir = entry.type === 'directory'
    const node = {
      name: entry.name,
      path: childRel,
      type: isDir ? 'dir' : (entry.type === 'file' ? 'file' : 'other'),
    }
    if (!isDir) {
      if (typeof entry.size === 'number') node.size = entry.size
      const abs = absPath(ctx, entry.target)
      if (typeof abs === 'string') node.abs = abs
    }
    out.push(node)
  }
  out.sort((a, b) => {
    if ((a.type === 'dir') !== (b.type === 'dir')) return a.type === 'dir' ? -1 : 1
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
  })
  return out
}

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

export const name = NAME
export const inject = ['fs', 'agents', 'webServer']

export default {
  name,
  inject,
  apply(ctx) {
    // GET /dsh-workspace-files/list?session=<id> → root level entries
    ctx.effect(() => ctx.webServer.register({
      kind: 'exact',
      path: '/dsh-workspace-files/list',
      handler: async (req, res) => {
        try {
          const u = new URL(req.url ?? '/', 'http://localhost')
          const sessionId = u.searchParams.get('session') ?? ''
          const resolved = await resolveRoot(ctx, sessionId)
          if (resolved.error !== undefined) return json(res, 200, { ok: false, error: resolved.error })
          const info = await ctx.fs.stat(resolved.root)
          if (info === undefined) return json(res, 200, { ok: false, error: 'NOT_FOUND' })
          if (info.type !== 'directory') return json(res, 200, { ok: false, error: 'NOT_A_DIRECTORY' })
          const entries = await listLevel(ctx, resolved.root, '')
          json(res, 200, { ok: true, root: resolved.rootPath, entries })
        } catch (error) {
          json(res, 200, { ok: false, error: 'LIST_FAILED', message: error && error.message ? String(error.message) : 'unknown' })
        }
      },
    }))

    // GET /dsh-workspace-files/dir?session=<id>&path=<rel> → one level
    ctx.effect(() => ctx.webServer.register({
      kind: 'exact',
      path: '/dsh-workspace-files/dir',
      handler: async (req, res) => {
        try {
          const u = new URL(req.url ?? '/', 'http://localhost')
          const sessionId = u.searchParams.get('session') ?? ''
          const rel = u.searchParams.get('path') ?? ''
          if (rel === '') return json(res, 200, { ok: false, error: 'INVALID_PATH' })
          const resolved = await resolveRoot(ctx, sessionId)
          if (resolved.error !== undefined) return json(res, 200, { ok: false, error: resolved.error })
          const target = await ctx.fs.resolve(rel, { cwd: resolved.rootPath })
          if (!ctx.fs.contains(resolved.root, target)) return json(res, 200, { ok: false, error: 'OUT_OF_BOUNDS' })
          const info = await ctx.fs.stat(target)
          if (info === undefined) return json(res, 200, { ok: false, error: 'NOT_FOUND' })
          if (info.type !== 'directory') return json(res, 200, { ok: false, error: 'NOT_A_DIRECTORY' })
          json(res, 200, { ok: true, entries: await listLevel(ctx, target, rel) })
        } catch (error) {
          json(res, 200, { ok: false, error: 'LIST_FAILED', message: error && error.message ? String(error.message) : 'unknown' })
        }
      },
    }))

    // GET /dsh-workspace-files/search?session=<id>&q=<query> → bounded name search
    ctx.effect(() => ctx.webServer.register({
      kind: 'exact',
      path: '/dsh-workspace-files/search',
      handler: async (req, res) => {
        try {
          const u = new URL(req.url ?? '/', 'http://localhost')
          const sessionId = u.searchParams.get('session') ?? ''
          const query = (u.searchParams.get('q') ?? '').trim().toLowerCase()
          if (query === '') return json(res, 200, { ok: true, matches: [], truncated: false })
          const resolved = await resolveRoot(ctx, sessionId)
          if (resolved.error !== undefined) return json(res, 200, { ok: false, error: resolved.error })
          const matches = []
          let visited = 0
          let truncated = false
          const walk = async (target, rel, depth) => {
            if (depth > MAX_SEARCH_DEPTH || truncated) return
            let entries
            try {
              entries = await ctx.fs.listDir(target)
            } catch {
              return
            }
            for (const entry of entries) {
              if (truncated) return
              visited += 1
              if (visited > MAX_SEARCH_VISIT) {
                truncated = true
                return
              }
              if (IGNORED.has(entry.name)) continue
              const childRel = rel === '' ? entry.name : rel + '/' + entry.name
              if (entry.name.toLowerCase().indexOf(query) >= 0) {
                const isDir = entry.type === 'directory'
                const match = {
                  name: entry.name,
                  path: childRel,
                  type: isDir ? 'dir' : (entry.type === 'file' ? 'file' : 'other'),
                }
                if (!isDir) {
                  if (typeof entry.size === 'number') match.size = entry.size
                  const abs = absPath(ctx, entry.target)
                  if (typeof abs === 'string') match.abs = abs
                }
                matches.push(match)
                if (matches.length >= MAX_SEARCH_MATCHES) {
                  truncated = true
                  return
                }
              }
              if (entry.type === 'directory') await walk(entry.target, childRel, depth + 1)
            }
          }
          await walk(resolved.root, '', 0)
          json(res, 200, { ok: true, matches, truncated })
        } catch (error) {
          json(res, 200, { ok: false, error: 'SEARCH_FAILED', message: error && error.message ? String(error.message) : 'unknown' })
        }
      },
    }))

    // GET /dsh-workspace-files/read?session=<id>&path=<rel> → bounded preview content
    ctx.effect(() => ctx.webServer.register({
      kind: 'exact',
      path: '/dsh-workspace-files/read',
      handler: async (req, res) => {
        try {
          const u = new URL(req.url ?? '/', 'http://localhost')
          const sessionId = u.searchParams.get('session') ?? ''
          const rel = u.searchParams.get('path') ?? ''
          if (rel === '') return json(res, 200, { ok: false, error: 'INVALID_PATH' })
          const resolved = await resolveRoot(ctx, sessionId)
          if (resolved.error !== undefined) return json(res, 200, { ok: false, error: resolved.error })
          const target = await ctx.fs.resolve(rel, { cwd: resolved.rootPath })
          if (!ctx.fs.contains(resolved.root, target)) return json(res, 200, { ok: false, error: 'OUT_OF_BOUNDS' })
          const info = await ctx.fs.stat(target)
          if (info === undefined) return json(res, 200, { ok: false, error: 'NOT_FOUND' })
          if (info.type !== 'file') return json(res, 200, { ok: false, error: 'NOT_A_FILE' })
          const size = typeof info.size === 'number' ? info.size : 0
          const dot = rel.lastIndexOf('.')
          const slash = rel.lastIndexOf('/')
          const ext = dot > slash ? rel.slice(dot + 1).toLowerCase() : ''
          if (ext === 'svg') {
            try {
              const text = await ctx.fs.readText(target)
              return json(res, 200, { ok: true, kind: 'image', dataUrl: 'data:image/svg+xml;base64,' + btoa(text), size })
            } catch {
              return json(res, 200, { ok: true, kind: 'binary', size })
            }
          }
          if (IMAGE_MIME[ext] !== undefined) {
            try {
              const bytes = await ctx.fs.readBytes(target, undefined, MAX_IMAGE_BYTES)
              return json(res, 200, { ok: true, kind: 'image', dataUrl: 'data:' + IMAGE_MIME[ext] + ';base64,' + bytesToBase64(bytes), size })
            } catch {
              return json(res, 200, { ok: true, kind: 'binary', size })
            }
          }
          try {
            let text = ''
            let truncated = false
            const stream = await ctx.fs.streamText(target)
            for await (const chunk of stream) {
              if (text.length + chunk.length > MAX_TEXT) {
                text += chunk.slice(0, MAX_TEXT - text.length)
                truncated = true
                break
              }
              text += chunk
            }
            return json(res, 200, { ok: true, kind: 'text', text, size, truncated })
          } catch {
            return json(res, 200, { ok: true, kind: 'binary', size })
          }
        } catch (error) {
          json(res, 200, { ok: false, error: 'READ_FAILED', message: error && error.message ? String(error.message) : 'unknown' })
        }
      },
    }))
  },
}
