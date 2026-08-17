/**
 * Vite 服务视图：工作区 Vite 项目扫描、dev server 启动/停止、状态与日志轮询。
 *
 * 交互模型（复用 Docker 面板的左右布局）：
 * - 左侧列出工作区内的 Vite 项目（含运行状态圆点）；
 * - 右侧展示选中项目的详情：启动命令（可编辑）、启动/停止、打开页面、实时日志；
 * - 状态每 2 秒轮询一次，URL/端口由 Host 从 vite 输出解析。
 */
import * as React from 'react'
import type { ReactNode } from 'react'
import { viteRpc, type ViteProject, type ViteRun } from './vite-rpc.js'

const sessionStores = new Map<string, { selected: string, command: string }>()

function sessionStore(sid: string): { selected: string, command: string } {
  let store = sessionStores.get(sid)
  if (store === undefined) {
    store = { selected: '', command: 'pnpm run dev' }
    sessionStores.set(sid, store)
  }
  return store
}

export interface ViteViewProps {
  sessionId?: unknown
}

export function VitePanel(props: ViteViewProps): ReactNode {
  const sid = typeof props.sessionId === 'string' ? props.sessionId : ''
  const store = sessionStore(sid)

  const [projects, setProjects] = React.useState<ViteProject[] | null>(null)
  const [runs, setRuns] = React.useState<ViteRun[]>([])
  const [selected, setSelected] = React.useState<string>(store.selected)
  const [command, setCommand] = React.useState<string>(store.command)
  const [error, setError] = React.useState('')

  React.useEffect(() => { store.selected = selected }, [selected])
  React.useEffect(() => { store.command = command }, [command])

  const refreshProjects = (): void => {
    viteRpc.projects(sid).then((res) => {
      if (res.ok) setProjects(res.projects)
    }).catch(() => {})
  }
  const refreshStatus = (): void => {
    viteRpc.status().then((res) => {
      if (res.ok) setRuns(res.runs)
    }).catch(() => {})
  }

  React.useEffect(() => {
    refreshProjects()
    refreshStatus()
  }, [sid])

  // 状态轮询（每 2 秒）。
  React.useEffect(() => {
    const timer = window.setInterval(refreshStatus, 2000)
    return () => window.clearInterval(timer)
  }, [])

  const runOf = (rel: string): ViteRun | undefined => runs.find((r) => r.key === rel)
  const isActive = (run: ViteRun | undefined): boolean =>
    run !== undefined && (run.status === 'running' || run.status === 'starting')

  const doStart = (project: ViteProject): void => {
    setError('')
    const cmd = command.trim() === '' ? 'pnpm run dev' : command.trim()
    viteRpc.start(sid, project.rel, cmd)
      .then((res) => {
        if (!res.ok) setError(res.error)
        else refreshStatus()
      })
      .catch(() => setError('启动失败（网络或命令错误）'))
  }
  const doStop = (key: string): void => {
    viteRpc.stop(key).then((res) => {
      if (!res.ok) setError(res.error)
    }).catch(() => {})
  }

  // ---- 左侧：项目列表 ----
  const projectRows = (projects ?? []).map((p) => {
    const run = runOf(p.rel)
    const active = isActive(run)
    const dot = active ? '●' : '○'
    const dotCls = active ? 'dshdc-dot dshdc-dot-on' : 'dshdc-dot'
    const sub = p.configFile !== '' ? p.configFile : (p.devScript !== '' ? 'dev: ' + p.devScript : 'vite')
    return React.createElement('div', {
      key: p.rel,
      className: selected === p.rel ? 'dshdc-row dshdc-row-active' : 'dshdc-row',
      onClick: () => setSelected(p.rel),
      title: p.dir,
    },
      React.createElement('span', { className: dotCls }, dot),
      React.createElement('div', { className: 'dshdc-row-main' },
        React.createElement('div', { className: 'dshdc-row-name' }, p.name),
        React.createElement('div', { className: 'dshdc-row-sub' }, sub),
      ),
      run !== undefined && run.status === 'running' && run.port !== undefined
        ? React.createElement('span', { className: 'dshdc-list-id' }, ':' + run.port)
        : null,
    )
  })

  const selectedProject = (projects ?? []).find((p) => p.rel === selected) ?? null
  const selectedRun = selected === '' ? undefined : runOf(selected)

  // ---- 右侧：详情 + 日志 ----
  let content: ReactNode
  if (selectedProject === null) {
    content = React.createElement('div', { className: 'dshdc-center' }, '选择左侧项目查看详情')
  } else {
    const running = isActive(selectedRun)
    const statusText = selectedRun === undefined ? '未启动'
      : selectedRun.status === 'running' ? '运行中'
        : selectedRun.status === 'starting' ? '启动中…'
          : selectedRun.status === 'error' ? '启动出错' : '已停止'
    content = React.createElement(React.Fragment, null,
      React.createElement('div', { className: 'dshdc-actions' },
        React.createElement('span', { className: 'dshdc-actions-label' }, '启动命令'),
        React.createElement('input', {
          className: 'dshdc-input',
          style: { width: 240 },
          value: command,
          onChange: (e: { target: { value: string } }) => setCommand(e.target.value),
          placeholder: 'pnpm run dev',
        }),
        running
          ? React.createElement('button', { type: 'button', className: 'dshdc-btn', onClick: () => doStop(selectedProject.rel) }, '停止')
          : React.createElement('button', { type: 'button', className: 'dshdc-btn dshdc-btn-on', onClick: () => doStart(selectedProject) }, '启动'),
        selectedRun !== undefined && selectedRun.status === 'running' && selectedRun.url !== undefined
          ? React.createElement('button', { type: 'button', className: 'dshdc-btn', onClick: () => window.open(selectedRun.url, '_blank') }, '打开 ' + selectedRun.url)
          : null,
      ),
      error !== '' ? React.createElement('div', { className: 'dshdc-error', style: { padding: '6px 12px' } }, error) : null,
      React.createElement('div', { className: 'dshdc-content', style: { display: 'flex', flexDirection: 'column' } },
        React.createElement('div', { className: 'dshdc-list-row', style: { flex: 'none' } },
          React.createElement('span', { className: 'dshdc-list-name' }, statusText),
          React.createElement('span', { className: 'dshdc-list-meta' },
            selectedRun !== undefined
              ? (selectedRun.pid !== null ? 'pid: ' + selectedRun.pid + ' · ' : '') + (selectedRun.url ?? selectedProject.dir)
              : selectedProject.dir),
        ),
        React.createElement('pre', { className: 'dshdc-log', style: { flex: 1, maxHeight: 'none', margin: '8px 12px' } },
          selectedRun !== undefined && selectedRun.log !== '' ? selectedRun.log : '（无输出，点击「启动」开始）'),
      ),
    )
  }

  return React.createElement('div', { className: 'dshdc-main' },
    React.createElement('div', { className: 'dshdc-side' },
      React.createElement('div', { className: 'dshdc-side-head' },
        React.createElement('span', null, 'Vite 项目'),
        React.createElement('button', { type: 'button', className: 'dshdc-mini', onClick: refreshProjects }, '刷新'),
      ),
      React.createElement('div', { className: 'dshdc-side-list' },
        projects === null
          ? React.createElement('div', { className: 'dshdc-center' }, '扫描中…')
          : projectRows.length > 0
            ? projectRows
            : React.createElement('div', { className: 'dshdc-center' }, '未发现 Vite 项目'),
      ),
    ),
    React.createElement('div', { className: 'dshdc-body' },
      React.createElement('div', { className: 'dshdc-bar' },
        React.createElement('span', { className: 'dshdc-title' }, selectedProject !== null ? selectedProject.name : 'Vite'),
        React.createElement('span', { className: 'dshdc-spacer' }),
      ),
      content,
    ),
  )
}
