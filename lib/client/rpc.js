/**
 * Host 路由的同源 fetch 封装 —— 与 src/contract.ts 的路由/参数名对齐。
 */
import { ROUTE_DIR, ROUTE_LIST, ROUTE_READ, ROUTE_SEARCH } from '../contract.js';
export async function rpc(route, params) {
    const parts = [];
    for (const key of Object.keys(params)) {
        const value = params[key];
        if (value === undefined || value === null)
            continue;
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(value)));
    }
    const url = route + (parts.length > 0 ? '?' + parts.join('&') : '');
    const res = await fetch(url);
    return res.json();
}
export const listRoot = (session) => rpc(ROUTE_LIST, { session });
export const listDir = (session, path) => rpc(ROUTE_DIR, { session, path });
export const searchFiles = (session, q) => rpc(ROUTE_SEARCH, { session, q });
export const readFile = (session, path) => rpc(ROUTE_READ, { session, path });
