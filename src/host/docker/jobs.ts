/**
 * 长任务注册表：pull / build / run / stop / remove 都是异步任务，
 * 这里维护任务状态与日志缓冲，浏览器端轮询查看进度。
 */
import { randomUUID } from 'node:crypto'

export type DockerJobKind = 'pull' | 'build' | 'run' | 'stop' | 'remove'

export interface DockerJob {
  id: string
  kind: DockerJobKind
  label: string
  status: 'running' | 'ok' | 'error'
  log: string
  detail?: string
  createdAt: number
}

const MAX_LOG = 200 * 1024
const MAX_JOBS = 100

const jobs = new Map<string, DockerJob>()

export function createJob(kind: DockerJobKind, label: string): DockerJob {
  const job: DockerJob = {
    id: randomUUID().slice(0, 12),
    kind,
    label,
    status: 'running',
    log: '',
    createdAt: Date.now(),
  }
  jobs.set(job.id, job)
  if (jobs.size > MAX_JOBS) {
    const oldest = [...jobs.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt)[0]
    if (oldest !== undefined) jobs.delete(oldest[0])
  }
  return job
}

export function appendLog(id: string, line: string): void {
  const job = jobs.get(id)
  if (job === undefined) return
  job.log = (job.log + line + '\n').slice(-MAX_LOG)
}

export function finishJob(id: string, status: 'ok' | 'error', detail?: string): void {
  const job = jobs.get(id)
  if (job === undefined) return
  job.status = status
  if (detail !== undefined) job.detail = detail
}

export function getJob(id: string): DockerJob | undefined {
  return jobs.get(id)
}

export function listJobs(): DockerJob[] {
  return [...jobs.values()].sort((a, b) => b.createdAt - a.createdAt)
}
