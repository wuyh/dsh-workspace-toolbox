/**
 * Vite 服务的浏览器端 RPC（Host 路由封装）。
 */
import type { ErrorResponse } from './types.js'

/** 成功响应 = ok:true + 业务字段；失败 = ErrorResponse。 */
export type ViteResult<T> = ({ ok: true } & T) | ErrorResponse

export interface ViteProject {
  name: string
  rel: string
  dir: string
  devScript: string
  configFile: string
}

export type ViteRunStatus = 'starting' | 'running' | 'stopped' | 'error'

export interface ViteRun {
  key: string
  name: string
  dir: string
  status: ViteRunStatus
  pid: number | null
  port?: number
  url?: string
  log: string
  startedAt: number
  stoppedAt?: number
}

const PREFIX = '/dsh-workspace-toolbox/vite'

async function get<T>(route: string): Promise<ViteResult<T>> {
  const res = await fetch(route)
  return res.json() as Promise<ViteResult<T>>
}

async function post<T>(route: string, body: Record<string, unknown>): Promise<ViteResult<T>> {
  const res = await fetch(route, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json() as Promise<ViteResult<T>>
}

export const viteRpc = {
  projects: (session: string) => get<{ projects: ViteProject[] }>(PREFIX + '/projects?session=' + encodeURIComponent(session)),
  status: () => get<{ runs: ViteRun[] }>(PREFIX + '/status'),
  start: (session: string, dir: string, command: string) => post<{ run: ViteRun }>(PREFIX + '/start', { session, dir, command }),
  stop: (key: string) => post<Record<string, never>>(PREFIX + '/stop', { key }),
}
