/**
 * “文件”视图组件：面包屑一层一屏浏览 + 全局搜索 + 多标签预览。
 *
 * 交互模型（类手机文件管理器）：
 * - 每屏只显示当前一层；点击目录进入、← 返回上级、面包屑任意跳转；
 * - 筛选框触发 Host 端全工作区搜索，点击结果目录直接进入；
 * - 单击文件在右侧打开**标签页**（浏览器式）：多个文件并存、点击切换、
 *   × 关闭，已打开的文件再次点击只是激活对应标签；
 * - 标签与内容按会话持久化在插件级 store 中，切换“对话/轨迹/文件”后恢复。
 */
import * as React from 'react'
import type { ReactNode } from 'react'
import { DockerPanel } from './docker-view.js'
import { detectLang, highlightCode, isMarkdown } from './highlight.js'
import { fileIcon, folderSvg } from './icons.js'
import { renderMarkdown } from './markdown.js'
import { listDir, listRoot, readFile, searchFiles } from './rpc.js'
import type { Entry, WorkspacesService } from './types.js'
import { VitePanel } from './vite-view.js'

/** 同时打开的标签上限（超出淘汰最旧的标签）。 */
const MAX_TABS = 10

const ERROR_TEXT: Record<string, string> = {
  NO_WORKSPACE: '当前会话没有关联工作区',
  NOT_FOUND: '工作区目录不存在',
  NOT_A_DIRECTORY: '工作区路径不是目录',
  LIST_FAILED: '文件列表读取失败',
  READ_FAILED: '文件读取失败',
  OUT_OF_BOUNDS: '路径超出工作区范围',
  NOT_A_FILE: '目标不是文件',
  SEARCH_FAILED: '搜索失败',
}

function fmtSize(n: number | undefined): string {
  if (typeof n !== 'number') return ''
  if (n < 1024) return n + ' B'
  if (n < 1048576) return (n / 1024).toFixed(1) + ' KB'
  return (n / 1048576).toFixed(1) + ' MB'
}

function parentOf(path: string): string {
  if (path === '') return ''
  const i = path.lastIndexOf('/')
  return i < 0 ? '' : path.slice(0, i)
}

// --- 按会话持久化的视图状态 ------------------------------------------------

interface ListState {
  phase: 'loading' | 'ready' | 'error'
  root: string
  entries: Entry[]
  error: string
}

interface DocState {
  phase: 'idle' | 'loading' | 'ready' | 'error'
  kind: 'text' | 'image' | 'binary' | ''
  text: string
  dataUrl: string
  size: number
  truncated: boolean
  error: string
  /** 已加载内容对应的相对路径（恢复时命中则不再请求）。 */
  forPath: string
}

interface SearchState {
  phase: 'idle' | 'loading' | 'ready' | 'error'
  query: string
  matches: Entry[]
  truncated: boolean
}

interface PreviewTab {
  path: string
  abs?: string
  name: string
}

interface SessionStore {
  state: ListState
  dirData: Record<string, Entry[]>
  pending: Record<string, boolean>
  currentPath: string
  filter: string
  treeVisible: boolean
  /** 打开的文件标签（浏览器式，按打开顺序排列）。 */
  tabs: PreviewTab[]
  /** 当前激活标签的相对路径（'' 表示无标签）。 */
  activePath: string
  /** 每个路径的已加载内容缓存。 */
  docs: Record<string, DocState>
  search: SearchState
  /** Markdown 预览的显示模式：渲染 / 源码。 */
  mdView: 'render' | 'source'
  /** 主区域模式：文件浏览 / Docker 服务 / Vite 项目。 */
  viewMode: 'files' | 'docker' | 'vite'
}

const sessionStores = new Map<string, SessionStore>()
const loadedSids = new Set<string>()

function emptyDoc(): DocState {
  return { phase: 'idle', kind: '', text: '', dataUrl: '', size: 0, truncated: false, error: '', forPath: '' }
}

function sessionStore(sid: string): SessionStore {
  let store = sessionStores.get(sid)
  if (store === undefined) {
    store = {
      state: { phase: 'loading', root: '', entries: [], error: '' },
      dirData: {},
      pending: {},
      currentPath: '',
      filter: '',
      treeVisible: true,
      tabs: [],
      activePath: '',
      docs: {},
      search: { phase: 'idle', query: '', matches: [], truncated: false },
      mdView: 'render',
      viewMode: 'files',
    }
    sessionStores.set(sid, store)
  }
  return store
}

// --- 组件 ------------------------------------------------------------------

export interface FilesViewProps {
  sessionId?: unknown
  workspaces?: WorkspacesService
}

export function FilesView(props: FilesViewProps): ReactNode {
  const sid = typeof props.sessionId === 'string' ? props.sessionId : ''
  const workspaces = props.workspaces
  const store = sessionStore(sid)
  const [state, setState] = React.useState<ListState>(store.state)
  const [dirData, setDirData] = React.useState<Record<string, Entry[]>>(store.dirData)
  const [pending, setPending] = React.useState<Record<string, boolean>>(store.pending)
  const [currentPath, setCurrentPath] = React.useState<string>(store.currentPath)
  const [filter, setFilter] = React.useState<string>(store.filter)
  const [reloadKey, setReloadKey] = React.useState(0)
  const [treeVisible, setTreeVisible] = React.useState<boolean>(store.treeVisible)
  const [tabs, setTabs] = React.useState<PreviewTab[]>(store.tabs)
  const [activePath, setActivePath] = React.useState<string>(store.activePath)
  const [docs, setDocs] = React.useState<Record<string, DocState>>(store.docs)
  const [search, setSearch] = React.useState<SearchState>(store.search)
  const [mdView, setMdView] = React.useState<'render' | 'source'>(store.mdView)
  const [viewMode, setViewMode] = React.useState<'files' | 'docker' | 'vite'>(store.viewMode)

  // 状态镜像回 store（组件因标签切换卸载时，store 存活并恢复）。
  React.useEffect(() => { store.state = state }, [state, sid])
  React.useEffect(() => { store.dirData = dirData }, [dirData, sid])
  React.useEffect(() => { store.pending = pending }, [pending, sid])
  React.useEffect(() => { store.currentPath = currentPath }, [currentPath, sid])
  React.useEffect(() => { store.filter = filter }, [filter, sid])
  React.useEffect(() => { store.treeVisible = treeVisible }, [treeVisible, sid])
  React.useEffect(() => { store.tabs = tabs }, [tabs, sid])
  React.useEffect(() => { store.activePath = activePath }, [activePath, sid])
  React.useEffect(() => { store.docs = docs }, [docs, sid])
  React.useEffect(() => { store.search = search }, [search, sid])
  React.useEffect(() => { store.mdView = mdView }, [mdView, sid])
  React.useEffect(() => { store.viewMode = viewMode }, [viewMode, sid])

  // 根目录列表：新会话全量重置；重进标签时静默刷新。
  React.useEffect(() => {
    const isNewSession = !loadedSids.has(sid)
    loadedSids.add(sid)
    if (isNewSession) {
      setDirData({})
      setPending({})
      setCurrentPath('')
      setPreviewReset()
      setFilter('')
    }
    let alive = true
    setState((prev) => (prev.phase === 'ready' ? prev : { phase: 'loading', root: '', entries: [], error: '' }))
    listRoot(sid).then((res) => {
      if (!alive) return
      if (res.ok) {
        setState({ phase: 'ready', root: res.root, entries: res.entries, error: '' })
        setDirData((d) => ({ ...d, '': res.entries }))
      } else {
        setState({ phase: 'error', root: '', entries: [], error: res.error })
      }
    }).catch(() => {
      if (alive) setState({ phase: 'error', root: '', entries: [], error: 'UNKNOWN' })
    })
    return () => { alive = false }
  }, [sid, reloadKey])

  // 激活标签的内容加载：docs 中同路径的已就绪内容直接复用。
  React.useEffect(() => {
    if (activePath === '') return
    const cached = docs[activePath]
    if (cached !== undefined && cached.forPath === activePath && cached.phase === 'ready') return
    const loading: DocState = { ...emptyDoc(), phase: 'loading', forPath: activePath }
    setDocs((d) => ({ ...d, [activePath]: loading }))
    let alive = true
    readFile(sid, activePath).then((res) => {
      if (!alive) return
      if (res.ok) {
        setDocs((d) => ({
          ...d,
          [activePath]: {
            phase: 'ready', kind: res.kind, text: res.text ?? '', dataUrl: res.dataUrl ?? '',
            size: res.size, truncated: res.truncated === true, error: '', forPath: activePath,
          },
        }))
      } else {
        setDocs((d) => ({ ...d, [activePath]: { ...emptyDoc(), phase: 'error', error: res.error, forPath: activePath } }))
      }
    }).catch(() => {
      if (alive) setDocs((d) => ({ ...d, [activePath]: { ...emptyDoc(), phase: 'error', error: 'UNKNOWN', forPath: activePath } }))
    })
    return () => { alive = false }
  }, [activePath, sid])

  // 全局搜索（输入即搜，Host 端有界遍历）。
  const q = filter.trim().toLowerCase()
  React.useEffect(() => {
    if (q === '') {
      setSearch({ phase: 'idle', query: '', matches: [], truncated: false })
      return
    }
    let alive = true
    setSearch({ phase: 'loading', query: q, matches: [], truncated: false })
    searchFiles(sid, q).then((res) => {
      if (!alive) return
      if (res.ok) {
        setSearch({ phase: 'ready', query: q, matches: res.matches, truncated: res.truncated })
      } else {
        setSearch({ phase: 'error', query: q, matches: [], truncated: false })
      }
    }).catch(() => {
      if (alive) setSearch({ phase: 'error', query: q, matches: [], truncated: false })
    })
    return () => { alive = false }
  }, [q, sid])

  const fetchDir = (path: string): void => {
    if (path === '' || dirData[path] !== undefined || pending[path] === true) return
    setPending((p) => ({ ...p, [path]: true }))
    listDir(sid, path).then((res) => {
      setDirData((d) => ({ ...d, [path]: res.ok ? res.entries : [] }))
    }).catch(() => {
      setDirData((d) => ({ ...d, [path]: [] }))
    }).then(() => setPending((p) => ({ ...p, [path]: false })))
  }

  const navigate = (path: string): void => {
    setCurrentPath(path)
    if (path !== '') fetchDir(path)
  }
  const goUp = (): void => navigate(parentOf(currentPath))

  const openPath = (abs: string | undefined): void => {
    if (typeof abs === 'string' && abs !== '' && workspaces !== undefined) workspaces.openPath(abs).catch(() => {})
  }
  const openRoot = (): void => {
    if (state.root !== '' && workspaces !== undefined) workspaces.openPath(state.root).catch(() => {})
  }

  /** 打开/激活一个文件标签；超过上限时淘汰最旧的标签。 */
  const openPreview = (node: Entry): void => {
    if (tabs.some((t) => t.path === node.path)) {
      setActivePath(node.path)
      return
    }
    const tab: PreviewTab = { path: node.path, abs: node.abs, name: node.name }
    let next = [...tabs, tab]
    let evicted: PreviewTab | undefined
    if (next.length > MAX_TABS) evicted = next.shift()
    setTabs(next)
    setActivePath(node.path)
    if (evicted !== undefined) {
      setDocs((d) => {
        const nextDocs = { ...d }
        delete nextDocs[evicted.path]
        return nextDocs
      })
    }
  }

  /** 关闭标签：若关闭的是激活标签，激活相邻标签。 */
  const closeTab = (path: string): void => {
    const idx = tabs.findIndex((t) => t.path === path)
    const nextTabs = tabs.filter((t) => t.path !== path)
    setTabs(nextTabs)
    setDocs((d) => {
      const nextDocs = { ...d }
      delete nextDocs[path]
      return nextDocs
    })
    if (activePath === path) {
      const neighbor = nextTabs[Math.min(Math.max(idx, 0), nextTabs.length - 1)]
      setActivePath(neighbor?.path ?? '')
    }
  }

  /** 新会话重置所有标签状态。 */
  const setPreviewReset = (): void => {
    setTabs([])
    setActivePath('')
    setDocs({})
  }

  const activeTab = tabs.find((t) => t.path === activePath) ?? null
  const activeDoc = activePath === '' ? null : (docs[activePath] ?? { ...emptyDoc(), phase: 'loading' as const, forPath: activePath })
  const isActive = (node: Entry): boolean => activePath === node.path

  function renderRow(node: Entry): ReactNode {
    if (node.type === 'dir') {
      return React.createElement('div', {
        key: node.path || node.name, className: 'dshfm-row',
        onClick: () => navigate(node.path), title: node.path || node.name,
      },
        React.createElement('span', { className: 'dshfm-chev' }, '\u203A'),
        folderSvg('dshfm-icon dshfm-icon-folder'),
        React.createElement('span', { className: 'dshfm-name' }, node.name + '/'),
        React.createElement('span', { className: 'dshfm-size' }, ''),
      )
    }
    const cls = isActive(node) ? 'dshfm-row dshfm-row-active' : 'dshfm-row'
    return React.createElement('div', {
      key: node.path || node.name, className: cls,
      onClick: () => openPreview(node), onDoubleClick: () => openPath(node.abs), title: node.path || node.name,
    },
      React.createElement('span', { className: 'dshfm-chev' }, ''),
      fileIcon(node.name),
      React.createElement('span', { className: 'dshfm-name' }, node.name),
      React.createElement('span', { className: 'dshfm-size' }, fmtSize(node.size)),
    )
  }

  function renderCrumbs(): ReactNode[] {
    const rootLabel = state.root === '' ? '工作区' : (state.root.split('/').filter(Boolean).pop() || state.root)
    const items: ReactNode[] = []
    items.push(React.createElement('button', {
      key: 'root', type: 'button', className: 'dshfm-crumb',
      disabled: currentPath === '', onClick: () => navigate(''), title: state.root || '工作区',
    }, rootLabel))
    if (currentPath !== '') {
      const parts = currentPath.split('/')
      let acc = ''
      for (let i = 0; i < parts.length; i += 1) {
        acc = acc === '' ? parts[i] : acc + '/' + parts[i]
        const p = acc
        const isLast = i === parts.length - 1
        items.push(React.createElement('span', { key: 's' + i, className: 'dshfm-crumb-sep' }, '\u203A'))
        items.push(React.createElement('button', {
          key: 'c' + i, type: 'button', className: 'dshfm-crumb',
          disabled: isLast, onClick: () => navigate(p),
        }, parts[i]))
      }
    }
    return items
  }

  function renderTabs(): ReactNode {
    return tabs.map((tab) => {
      const active = tab.path === activePath
      return React.createElement('div', {
        key: tab.path, className: active ? 'dshfm-tab dshfm-tab-active' : 'dshfm-tab',
        onClick: () => setActivePath(tab.path), title: tab.path,
      },
        React.createElement('span', { className: 'dshfm-tab-name' }, tab.name),
        React.createElement('button', {
          type: 'button', className: 'dshfm-tab-close', title: '关闭',
          onClick: (e: { stopPropagation(): void }) => { e.stopPropagation(); closeTab(tab.path) },
        }, '\u00D7'),
      )
    })
  }

  const curEntries = dirData[currentPath]
  const curPending = pending[currentPath] === true

  let treeBody: ReactNode
  if (q !== '') {
    if (search.phase === 'loading') {
      treeBody = React.createElement('div', { className: 'dshfm-center' }, '搜索中…')
    } else if (search.phase === 'error') {
      treeBody = React.createElement('div', { className: 'dshfm-center' }, '搜索失败')
    } else if (search.phase === 'ready' && search.matches.length === 0) {
      treeBody = React.createElement('div', { className: 'dshfm-center' }, '没有匹配的文件')
    } else if (search.phase === 'ready') {
      const rows = search.matches.map((m) => {
        if (m.type === 'dir') {
          return React.createElement('div', {
            key: 'd' + m.path, className: 'dshfm-row',
            onClick: () => { navigate(m.path); setFilter('') }, title: m.path,
          },
            folderSvg('dshfm-icon dshfm-icon-folder'),
            React.createElement('span', { className: 'dshfm-name' }, m.path + '/'),
            React.createElement('span', { className: 'dshfm-size' }, ''),
          )
        }
        const cls = isActive(m) ? 'dshfm-row dshfm-row-active' : 'dshfm-row'
        return React.createElement('div', {
          key: 'f' + m.path, className: cls,
          onClick: () => openPreview(m), onDoubleClick: () => openPath(m.abs), title: m.path,
        },
          fileIcon(m.name),
          React.createElement('span', { className: 'dshfm-name' }, m.path),
          React.createElement('span', { className: 'dshfm-size' }, fmtSize(m.size)),
        )
      })
      treeBody = search.truncated
        ? React.createElement(React.Fragment, null, rows, React.createElement('div', { className: 'dshfm-note', style: { borderTop: 'none' } }, '匹配过多，仅显示前 200 条'))
        : rows
    }
  } else if (state.phase === 'loading') {
    treeBody = React.createElement('div', { className: 'dshfm-center' }, '加载中…')
  } else if (state.phase === 'error') {
    treeBody = React.createElement('div', { className: 'dshfm-center' }, ERROR_TEXT[state.error] ?? ('加载失败：' + state.error))
  } else if (curEntries === undefined || curPending) {
    treeBody = React.createElement('div', { className: 'dshfm-center' }, '加载中…')
  } else if (curEntries.length === 0) {
    treeBody = React.createElement('div', { className: 'dshfm-center' }, '此目录为空')
  } else {
    treeBody = curEntries.map((entry) => renderRow(entry))
  }

  function renderCodeView(text: string, lang: string): ReactNode {
    const lines = text.split('\n')
    const capped = lines.length > 3000
    const shownText = capped ? lines.slice(0, 3000).join('\n') : text
    const html = highlightCode(shownText, lang)
    const count = capped ? 3000 : lines.length
    const gutter: ReactNode[] = []
    for (let i = 0; i < count; i += 1) gutter.push(React.createElement('div', { className: 'dshfm-ln', key: i }, String(i + 1)))
    return React.createElement('div', { className: 'dshfm-code' },
      React.createElement('div', { className: 'dshfm-gutter' }, gutter),
      React.createElement('div', { className: 'dshfm-code-text' },
        React.createElement('pre', { className: 'dshfm-code-pre', dangerouslySetInnerHTML: { __html: html } }),
      ),
    )
  }

  function renderPreviewBody(): ReactNode {
    if (activeTab === null || activeDoc === null) {
      return React.createElement('div', { className: 'dshfm-center' }, '点击左侧文件进行预览（多个文件以标签页打开），双击可在系统中打开')
    }
    if (activeDoc.phase === 'loading') return React.createElement('div', { className: 'dshfm-center' }, '加载中…')
    if (activeDoc.phase === 'error') return React.createElement('div', { className: 'dshfm-center' }, '预览失败：' + (ERROR_TEXT[activeDoc.error] ?? activeDoc.error))
    if (activeDoc.kind === 'text') {
      // Markdown：默认渲染视图（marked + DOMPurify），可切换源码视图。
      if (isMarkdown(activeTab.name) && mdView === 'render') {
        const html = renderMarkdown(activeDoc.text)
        return React.createElement('div', { className: 'dshfm-md', dangerouslySetInnerHTML: { __html: html } })
      }
      return renderCodeView(activeDoc.text, detectLang(activeTab.name))
    }
    if (activeDoc.kind === 'image') {
      return React.createElement('div', { style: { padding: 12 } }, React.createElement('img', { className: 'dshfm-img', src: activeDoc.dataUrl, alt: activeTab.name }))
    }
    return React.createElement('div', { className: 'dshfm-center' },
      React.createElement('div', null, '二进制文件，无法直接预览'),
      React.createElement('div', { style: { marginTop: 6 } }, fmtSize(activeDoc.size)),
      React.createElement('button', { type: 'button', className: 'dshfm-btn', style: { marginTop: 14 }, onClick: () => openPath(activeTab.abs) }, '在系统中打开'),
    )
  }

  let note: ReactNode = null
  if (activeTab !== null && activeDoc !== null && activeDoc.phase === 'ready' && activeDoc.kind === 'text' && (activeDoc.truncated || activeDoc.text.split('\n').length > 3000)) {
    note = React.createElement('div', { className: 'dshfm-note' }, '内容过长，仅预览前 256 KB')
  }

  return React.createElement('div', { className: 'dshfm-root', 'data-conversation-composer-overlay': '' },
    React.createElement('div', { className: 'dshfm-bar' },
      React.createElement('button', { type: 'button', className: viewMode === 'files' ? 'dshfm-btn dshfm-btn-on' : 'dshfm-btn', onClick: () => setViewMode('files') }, '文件'),
      React.createElement('button', { type: 'button', className: viewMode === 'docker' ? 'dshfm-btn dshfm-btn-on' : 'dshfm-btn', onClick: () => setViewMode('docker') }, 'Docker'),
      React.createElement('button', { type: 'button', className: viewMode === 'vite' ? 'dshfm-btn dshfm-btn-on' : 'dshfm-btn', onClick: () => setViewMode('vite') }, 'Vite'),
      viewMode === 'files' ? React.createElement(React.Fragment, null,
        React.createElement('button', { type: 'button', className: treeVisible ? 'dshfm-btn dshfm-btn-on' : 'dshfm-btn', title: '显示/隐藏目录', onClick: () => setTreeVisible((v) => !v) }, '☰'),
        React.createElement('span', { className: 'dshfm-path', title: state.root }, state.root || '—'),
        React.createElement('input', { className: 'dshfm-input', value: filter, placeholder: '筛选…', onChange: (e) => setFilter(e.target.value) }),
        React.createElement('button', { type: 'button', className: 'dshfm-btn', onClick: () => setReloadKey((k) => k + 1) }, '刷新'),
        React.createElement('button', { type: 'button', className: 'dshfm-btn', onClick: openRoot, disabled: state.root === '' }, '打开目录'),
      ) : null,
    ),
    React.createElement('div', { className: 'dshfm-main' },
      viewMode === 'docker' ? React.createElement('div', { className: 'dshfm-docker-wrap' },
        React.createElement(DockerPanel, { sessionId: sid }),
      ) : null,
      viewMode === 'vite' ? React.createElement('div', { className: 'dshfm-docker-wrap' },
        React.createElement(VitePanel, { sessionId: sid }),
      ) : null,
      viewMode === 'files' && treeVisible ? React.createElement('div', { className: 'dshfm-tree' },
        React.createElement('div', { className: 'dshfm-tree-head' },
          React.createElement('button', { type: 'button', className: 'dshfm-btn dshfm-back', title: '返回上一级', disabled: currentPath === '', onClick: goUp }, '\u2190'),
          React.createElement('div', { className: 'dshfm-crumbs' }, renderCrumbs()),
        ),
        React.createElement('div', { className: 'dshfm-tree-body' }, treeBody),
      ) : null,
      viewMode === 'files' ? React.createElement('div', { className: 'dshfm-preview' },
        tabs.length > 0 ? React.createElement('div', { className: 'dshfm-tabs' }, renderTabs()) : null,
        React.createElement('div', { className: 'dshfm-preview-head' },
          React.createElement('span', { className: 'dshfm-preview-name' }, activeTab === null ? '预览' : activeTab.name),
          activeTab === null ? null : React.createElement('span', { className: 'dshfm-preview-meta', title: activeTab.path }, activeTab.path + (activeDoc !== null && activeDoc.size > 0 ? ' · ' + fmtSize(activeDoc.size) : '')),
          React.createElement('span', { className: 'dshfm-preview-spacer' }),
          activeTab !== null && activeDoc !== null && activeDoc.kind === 'text' && isMarkdown(activeTab.name)
            ? React.createElement('button', {
                type: 'button',
                className: mdView === 'render' ? 'dshfm-btn dshfm-btn-on' : 'dshfm-btn',
                onClick: () => setMdView((v) => (v === 'render' ? 'source' : 'render')),
              }, mdView === 'render' ? '源码' : '预览')
            : null,
          activeTab === null ? null : React.createElement('button', { type: 'button', className: 'dshfm-btn', onClick: () => openPath(activeTab.abs) }, '在系统中打开'),
          activeTab === null ? null : React.createElement('button', { type: 'button', className: 'dshfm-btn', onClick: () => closeTab(activeTab.path) }, '关闭'),
        ),
        React.createElement('div', { className: 'dshfm-preview-body' }, renderPreviewBody()),
        note,
      ) : null,
    ),
  )
}
