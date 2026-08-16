/**
 * Host/Client 共享的 HTTP 路由契约 —— Host 注册这些路由，浏览器端通过
 * 同源 fetch 调用。路由与参数名是两端唯一需要保持一致的部分。
 */

/** 工作区根目录列表（一层的条目 + 根路径）。参数：session。 */
export const ROUTE_LIST = '/dsh-workspace-files/list'

/** 单层目录列表。参数：session、path（相对路径）。 */
export const ROUTE_DIR = '/dsh-workspace-files/dir'

/** 全工作区文件名搜索。参数：session、q。 */
export const ROUTE_SEARCH = '/dsh-workspace-files/search'

/** 单文件只读预览。参数：session、path（相对路径）。 */
export const ROUTE_READ = '/dsh-workspace-files/read'
