/**
 * Docker 服务的 HTTP 路由：连接管理、镜像/容器查询、长任务（拉取/构建/
 * 运行/停止/删除）与任务日志轮询、工作区 Dockerfile 项目扫描。
 *
 * 所有路由挂在 /dsh-workspace-toolbox/docker/* 下，方法 GET/POST。
 */
import { spawn } from 'node:child_process'
import type { Context } from '@deepseek-ai/cordis'
import type { WebRequest, WebResponse } from '../services.js'
import { resolveRoot } from '../workspace.js'
import { docker, formatDockerProgress } from './engine.js'
import { appendLog, createJob, finishJob, getJob, listJobs } from './jobs.js'
import { backendOf, connect, disconnect, listConnections } from './manager.js'
import { addWorkspaceProject, listWorkspaceProjects, scanAllDockerfileModules } from './projects.js'

const PREFIX = '/dsh-workspace-toolbox/docker'

function json(res: WebResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

async function readJsonBody(req: WebRequest): Promise<Record<string, unknown>> {
  const chunks: Uint8Array[] = []
  for await (const chunk of req) chunks.push(chunk as Uint8Array)
  if (chunks.length === 0) return {}
  const text = Buffer.concat(chunks).toString('utf8')
  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    return {}
  }
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** 将项目目录打包为 tar 流（构建上下文）；复用系统 tar，无第三方依赖。 */
function tarDirectory(dir: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const child = spawn('tar', ['-czf', '-', '-C', dir, '.'], { stdio: ['ignore', 'pipe', 'ignore'] })
    const chunks: Buffer[] = []
    child.stdout.on('data', (c: Buffer) => chunks.push(c))
    child.on('error', reject)
    child.on('close', (code) => {
      if (code !== 0) reject(new Error(`tar exited with code ${code}`))
      else resolve(Buffer.concat(chunks))
    })
  })
}

function runDetached(runner: (jobId: string) => Promise<void>, jobId: string): void {
  runner(jobId).catch((error) => {
    appendLog(jobId, '任务失败：' + messageOf(error))
    finishJob(jobId, 'error', messageOf(error))
  })
}

export function registerDockerRoutes(ctx: Context): void {
  // GET /docker/projects?session=<id> → 工作区 Dockerfile 项目（自动扫描 ∪ 已添加）
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: PREFIX + '/projects',
    handler: async (req, res) => {
      try {
        const u = new URL(req.url ?? '/', 'http://localhost')
        const resolved = await resolveRoot(ctx, u.searchParams.get('session') ?? '')
        if ('error' in resolved) return json(res, 200, { ok: false, error: resolved.error })
        json(res, 200, { ok: true, projects: listWorkspaceProjects(resolved.rootPath) })
      } catch (error) {
        json(res, 200, { ok: false, error: 'SCAN_FAILED', message: messageOf(error) })
      }
    },
  }))

  // GET /docker/projects/candidates?session=<id> → 深层全量 Dockerfile 模块候选
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: PREFIX + '/projects/candidates',
    handler: async (req, res) => {
      try {
        const u = new URL(req.url ?? '/', 'http://localhost')
        const resolved = await resolveRoot(ctx, u.searchParams.get('session') ?? '')
        if ('error' in resolved) return json(res, 200, { ok: false, error: resolved.error })
        json(res, 200, { ok: true, projects: scanAllDockerfileModules(resolved.rootPath) })
      } catch (error) {
        json(res, 200, { ok: false, error: 'SCAN_FAILED', message: messageOf(error) })
      }
    },
  }))

  // POST /docker/projects/add { session, dir } → 添加项目并持久化
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: PREFIX + '/projects/add',
    handler: async (req, res) => {
      try {
        const body = await readJsonBody(req)
        const resolved = await resolveRoot(ctx, str(body.session))
        if ('error' in resolved) return json(res, 200, { ok: false, error: resolved.error })
        const rel = str(body.dir).trim()
        if (rel === '') return json(res, 200, { ok: false, error: 'INVALID_DIR' })
        // 目录必须位于工作区之内。
        const target = await ctx.fs.resolve(rel, { cwd: resolved.rootPath })
        if (!ctx.fs.contains(resolved.root, target)) return json(res, 200, { ok: false, error: 'OUT_OF_BOUNDS' })
        const result = addWorkspaceProject(resolved.rootPath, rel)
        if (!result.ok) return json(res, 200, { ok: false, error: result.error })
        json(res, 200, { ok: true, projects: result.projects })
      } catch (error) {
        json(res, 200, { ok: false, error: 'ADD_FAILED', message: messageOf(error) })
      }
    },
  }))

  // GET /docker/connections → 连接列表（含连接状态）
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: PREFIX + '/connections',
    handler: async (_req, res) => {
      json(res, 200, { ok: true, connections: listConnections() })
    },
  }))

  // POST /docker/connect { spec } → 建立连接（校验可达性）
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: PREFIX + '/connect',
    handler: async (req, res) => {
      try {
        const body = await readJsonBody(req)
        const spec = body.spec as Record<string, unknown> | undefined
        if (spec === undefined || typeof spec !== 'object') return json(res, 200, { ok: false, error: 'INVALID_SPEC' })
        const connection = await connect(spec as never)
        json(res, 200, { ok: true, connection })
      } catch (error) {
        json(res, 200, { ok: false, error: 'CONNECT_FAILED', message: messageOf(error) })
      }
    },
  }))

  // POST /docker/disconnect { id, forget }
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: PREFIX + '/disconnect',
    handler: async (req, res) => {
      const body = await readJsonBody(req)
      disconnect(str(body.id), body.forget === true)
      json(res, 200, { ok: true })
    },
  }))

  // GET /docker/images?connection=<id>
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: PREFIX + '/images',
    handler: async (req, res) => {
      try {
        const u = new URL(req.url ?? '/', 'http://localhost')
        const images = await docker.listImages(backendOf(u.searchParams.get('connection') ?? 'local'))
        json(res, 200, { ok: true, images })
      } catch (error) {
        json(res, 200, { ok: false, error: 'LIST_FAILED', message: messageOf(error) })
      }
    },
  }))

  // GET /docker/containers?connection=<id>
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: PREFIX + '/containers',
    handler: async (req, res) => {
      try {
        const u = new URL(req.url ?? '/', 'http://localhost')
        const containers = await docker.listContainers(backendOf(u.searchParams.get('connection') ?? 'local'))
        json(res, 200, { ok: true, containers })
      } catch (error) {
        json(res, 200, { ok: false, error: 'LIST_FAILED', message: messageOf(error) })
      }
    },
  }))

  // POST /docker/pull { connection, image } → { jobId }
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: PREFIX + '/pull',
    handler: async (req, res) => {
      const body = await readJsonBody(req)
      const image = str(body.image).trim()
      if (image === '') return json(res, 200, { ok: false, error: 'INVALID_IMAGE' })
      const job = createJob('pull', `拉取镜像 ${image}`)
      json(res, 200, { ok: true, jobId: job.id })
      runDetached(async (jobId) => {
        const backend = backendOf(str(body.connection) || 'local')
        const { status } = await docker.pull(backend, image, (line) => appendLog(jobId, formatDockerProgress(line)))
        finishJob(jobId, status < 300 ? 'ok' : 'error')
      }, job.id)
    },
  }))

  // POST /docker/build { session, connection, dir, tag } → { jobId }
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: PREFIX + '/build',
    handler: async (req, res) => {
      try {
        const body = await readJsonBody(req)
        const resolved = await resolveRoot(ctx, str(body.session))
        if ('error' in resolved) return json(res, 200, { ok: false, error: resolved.error })
        const dir = str(body.dir).trim()
        const tag = str(body.tag).trim()
        if (dir === '' || tag === '') return json(res, 200, { ok: false, error: 'INVALID_ARGS' })
        // 项目目录必须位于工作区之内（dir 是相对路径）。
        const target = await ctx.fs.resolve(dir, { cwd: resolved.rootPath })
        if (!ctx.fs.contains(resolved.root, target)) return json(res, 200, { ok: false, error: 'OUT_OF_BOUNDS' })
        const absDir = ctx.fs.processPath(target)
        const job = createJob('build', `构建镜像 ${tag}（${dir}）`)
        json(res, 200, { ok: true, jobId: job.id })
        runDetached(async (jobId) => {
          const backend = backendOf(str(body.connection) || 'local')
          appendLog(jobId, `打包构建上下文：${dir}`)
          const tar = await tarDirectory(absDir)
          appendLog(jobId, `上下文 ${(tar.length / 1024).toFixed(1)} KB，开始构建…`)
          const { status } = await docker.build(backend, tar, tag, (line) => appendLog(jobId, formatDockerProgress(line)))
          finishJob(jobId, status < 300 ? 'ok' : 'error')
        }, job.id)
      } catch (error) {
        json(res, 200, { ok: false, error: 'BUILD_FAILED', message: messageOf(error) })
      }
    },
  }))

  // POST /docker/run { connection, image, name?, ports?, env? } → { jobId }
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: PREFIX + '/run',
    handler: async (req, res) => {
      const body = await readJsonBody(req)
      const image = str(body.image).trim()
      if (image === '') return json(res, 200, { ok: false, error: 'INVALID_IMAGE' })
      const payload = { image, name: str(body.name), ports: arrayOf(body.ports), env: arrayOf(body.env) }
      const job = createJob('run', `运行容器（${image}）`)
      json(res, 200, { ok: true, jobId: job.id })
      runDetached(async (jobId) => {
        const backend = backendOf(str(body.connection) || 'local')
        const created = await docker.createContainer(backend, payload)
        await docker.startContainer(backend, created.Id)
        appendLog(jobId, `容器已启动：${created.Id}`)
        finishJob(jobId, 'ok', created.Id)
      }, job.id)
    },
  }))

  // POST /docker/stop { connection, id } → { jobId }
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: PREFIX + '/stop',
    handler: async (req, res) => {
      const body = await readJsonBody(req)
      const id = str(body.id).trim()
      if (id === '') return json(res, 200, { ok: false, error: 'INVALID_ID' })
      const job = createJob('stop', `停止容器 ${id.slice(0, 12)}`)
      json(res, 200, { ok: true, jobId: job.id })
      runDetached(async (jobId) => {
        await docker.stopContainer(backendOf(str(body.connection) || 'local'), id)
        appendLog(jobId, '容器已停止')
        finishJob(jobId, 'ok')
      }, job.id)
    },
  }))

  // POST /docker/remove { connection, id } → { jobId }
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: PREFIX + '/remove',
    handler: async (req, res) => {
      const body = await readJsonBody(req)
      const id = str(body.id).trim()
      if (id === '') return json(res, 200, { ok: false, error: 'INVALID_ID' })
      const job = createJob('remove', `删除容器 ${id.slice(0, 12)}`)
      json(res, 200, { ok: true, jobId: job.id })
      runDetached(async (jobId) => {
        await docker.removeContainer(backendOf(str(body.connection) || 'local'), id)
        appendLog(jobId, '容器已删除')
        finishJob(jobId, 'ok')
      }, job.id)
    },
  }))

  // POST /docker/remove-image { connection, id } → { jobId }
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: PREFIX + '/remove-image',
    handler: async (req, res) => {
      const body = await readJsonBody(req)
      const id = str(body.id).trim()
      if (id === '') return json(res, 200, { ok: false, error: 'INVALID_ID' })
      const job = createJob('remove', `删除镜像 ${id.slice(0, 12)}`)
      json(res, 200, { ok: true, jobId: job.id })
      runDetached(async (jobId) => {
        await docker.removeImage(backendOf(str(body.connection) || 'local'), id)
        appendLog(jobId, '镜像已删除')
        finishJob(jobId, 'ok')
      }, job.id)
    },
  }))

  // GET /docker/jobs → 任务列表；GET /docker/jobs?id= → 单个任务
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: PREFIX + '/jobs',
    handler: async (req, res) => {
      const u = new URL(req.url ?? '/', 'http://localhost')
      const id = u.searchParams.get('id') ?? ''
      if (id !== '') {
        const job = getJob(id)
        if (job === undefined) return json(res, 200, { ok: false, error: 'NOT_FOUND' })
        return json(res, 200, { ok: true, job })
      }
      json(res, 200, { ok: true, jobs: listJobs() })
    },
  }))

  // GET /docker/logs?connection=&id= → 容器日志（最近 200 行）
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: PREFIX + '/logs',
    handler: async (req, res) => {
      try {
        const u = new URL(req.url ?? '/', 'http://localhost')
        const id = u.searchParams.get('id') ?? ''
        if (id === '') return json(res, 200, { ok: false, error: 'INVALID_ID' })
        const logs = await docker.containerLogs(backendOf(u.searchParams.get('connection') ?? 'local'), id)
        json(res, 200, { ok: true, logs })
      } catch (error) {
        json(res, 200, { ok: false, error: 'LOGS_FAILED', message: messageOf(error) })
      }
    },
  }))
}

function arrayOf(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === 'string')
}
