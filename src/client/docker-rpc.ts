/**
 * Docker 服务的浏览器端 RPC（Host 路由封装）。
 */
import type { ErrorResponse } from './types.js'

/** 成功响应 = ok:true + 业务字段；失败 = ErrorResponse。 */
export type DockerResult<T> = ({ ok: true } & T) | ErrorResponse

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
  engine?: { version?: string, apiVersion?: string }
}

export interface DockerProject {
  name: string
  /** 相对工作区根的路径（唯一标识）。 */
  rel: string
  dir: string
  dockerfile: string
}

export interface DockerImageRow {
  Id: string
  RepoTags: string[] | null
  Size: number
  Created: number
}

export interface DockerContainerRow {
  Id: string
  Names: string[]
  Image: string
  State: string
  Status: string
  Ports: Array<{ IP?: string, PublicPort?: number, PrivatePort: number, Type: string }>
}

export interface DockerJob {
  id: string
  kind: 'pull' | 'build' | 'run' | 'stop' | 'remove'
  label: string
  status: 'running' | 'ok' | 'error'
  log: string
  detail?: string
  createdAt: number
}

const PREFIX = '/dsh-workspace-toolbox/docker'

async function get<T>(route: string): Promise<DockerResult<T>> {
  const res = await fetch(route)
  return res.json() as Promise<DockerResult<T>>
}

async function post<T>(route: string, body: Record<string, unknown>): Promise<DockerResult<T>> {
  const res = await fetch(route, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json() as Promise<DockerResult<T>>
}

export const dockerRpc = {
  projects: (session: string) => get<{ projects: DockerProject[] }>(PREFIX + '/projects?session=' + encodeURIComponent(session)),
  projectsCandidates: (session: string) => get<{ projects: DockerProject[] }>(PREFIX + '/projects/candidates?session=' + encodeURIComponent(session)),
  projectAdd: (session: string, dir: string) => post<{ projects: DockerProject[] }>(PREFIX + '/projects/add', { session, dir }),
  connections: () => get<{ connections: DockerConnectionView[] }>(PREFIX + '/connections'),
  connect: (spec: Record<string, unknown>) => post<{ connection: DockerConnectionView }>(PREFIX + '/connect', { spec }),
  disconnect: (id: string, forget: boolean) => post<Record<string, never>>(PREFIX + '/disconnect', { id, forget }),
  images: (connection: string) => get<{ images: DockerImageRow[] }>(PREFIX + '/images?connection=' + encodeURIComponent(connection)),
  containers: (connection: string) => get<{ containers: DockerContainerRow[] }>(PREFIX + '/containers?connection=' + encodeURIComponent(connection)),
  pull: (connection: string, image: string) => post<{ jobId: string }>(PREFIX + '/pull', { connection, image }),
  build: (session: string, connection: string, dir: string, tag: string) => post<{ jobId: string }>(PREFIX + '/build', { session, connection, dir, tag }),
  run: (connection: string, image: string, name: string, ports: string[], env: string[]) => post<{ jobId: string }>(PREFIX + '/run', { connection, image, name, ports, env }),
  stop: (connection: string, id: string) => post<{ jobId: string }>(PREFIX + '/stop', { connection, id }),
  remove: (connection: string, id: string) => post<{ jobId: string }>(PREFIX + '/remove', { connection, id }),
  removeImage: (connection: string, id: string) => post<{ jobId: string }>(PREFIX + '/remove-image', { connection, id }),
  jobs: () => get<{ jobs: DockerJob[] }>(PREFIX + '/jobs'),
  job: (id: string) => get<{ job: DockerJob }>(PREFIX + '/jobs?id=' + encodeURIComponent(id)),
  logs: (connection: string, id: string) => get<{ logs: string }>(PREFIX + '/logs?connection=' + encodeURIComponent(connection) + '&id=' + encodeURIComponent(id)),
}
