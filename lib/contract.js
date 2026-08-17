/**
 * Host/Client 共享的 HTTP 路由契约 —— Host 注册这些路由，浏览器端通过
 * 同源 fetch 调用。路由与参数名是两端唯一需要保持一致的部分。
 */
/** 工作区根目录列表（一层的条目 + 根路径）。参数：session。 */
export const ROUTE_LIST = '/dsh-workspace-toolbox/list';
/** 单层目录列表。参数：session、path（相对路径）。 */
export const ROUTE_DIR = '/dsh-workspace-toolbox/dir';
/** 全工作区文件名搜索。参数：session、q。 */
export const ROUTE_SEARCH = '/dsh-workspace-toolbox/search';
/** 单文件只读预览。参数：session、path（相对路径）。 */
export const ROUTE_READ = '/dsh-workspace-toolbox/read';
/** 工作区 Vite 项目列表。参数：session。 */
export const ROUTE_VITE_PROJECTS = '/dsh-workspace-toolbox/vite/projects';
/** 所有 Vite dev server 的运行状态（含日志）。无参数。 */
export const ROUTE_VITE_STATUS = '/dsh-workspace-toolbox/vite/status';
/** 启动一个 Vite dev server。参数：session、dir（相对路径）、command（可选）。 */
export const ROUTE_VITE_START = '/dsh-workspace-toolbox/vite/start';
/** 停止一个 Vite dev server。参数：key（相对路径）。 */
export const ROUTE_VITE_STOP = '/dsh-workspace-toolbox/vite/stop';
