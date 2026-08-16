/**
 * Client 侧的共享类型：Host 路由的线格式 + 本插件用到的服务面。
 */
import type { ReactNode } from 'react'

export interface Entry {
  name: string
  path: string
  type: 'dir' | 'file' | 'other'
  size?: number
  abs?: string
}

export interface ListResponse {
  ok: true
  root: string
  entries: Entry[]
}

export interface DirResponse {
  ok: true
  entries: Entry[]
}

export interface SearchResponse {
  ok: true
  matches: Entry[]
  truncated: boolean
}

export interface ReadResponse {
  ok: true
  kind: 'text' | 'image' | 'binary'
  text?: string
  dataUrl?: string
  size: number
  truncated?: boolean
}

export interface ErrorResponse {
  ok: false
  error: string
}

export type RpcResult<T> = T | ErrorResponse

export interface SlotRegistrationOptions {
  name: string
  id: string
  order: number
  label: () => string
}

export interface SlotRegistry {
  inject(key: string, callback: () => () => void): () => void
  register(options: SlotRegistrationOptions, renderer: (props: Record<string, unknown>) => ReactNode): () => void
}

export interface WorkspacesService {
  openPath(path: string): Promise<void>
}
