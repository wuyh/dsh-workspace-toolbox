/**
 * Host 路由的同源 fetch 封装 —— 与 src/contract.ts 的路由/参数名对齐。
 */
import { ROUTE_DIR, ROUTE_LIST, ROUTE_READ, ROUTE_SEARCH } from '../contract.js'
import type { DirResponse, ListResponse, ReadResponse, RpcResult, SearchResponse } from './types.js'

export interface RpcParams {
  session: string
  path?: string
  q?: string
}

export async function rpc<T>(route: string, params: RpcParams): Promise<RpcResult<T>> {
  const parts: string[] = []
  for (const key of Object.keys(params)) {
    const value = (params as unknown as Record<string, unknown>)[key]
    if (value === undefined || value === null) continue
    parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(value)))
  }
  const url = route + (parts.length > 0 ? '?' + parts.join('&') : '')
  const res = await fetch(url)
  return res.json() as Promise<RpcResult<T>>
}

export const listRoot = (session: string) => rpc<ListResponse>(ROUTE_LIST, { session })

export const listDir = (session: string, path: string) => rpc<DirResponse>(ROUTE_DIR, { session, path })

export const searchFiles = (session: string, q: string) => rpc<SearchResponse>(ROUTE_SEARCH, { session, q })

export const readFile = (session: string, path: string) => rpc<ReadResponse>(ROUTE_READ, { session, path })
