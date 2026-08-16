/**
 * “文件”视图组件：面包屑一层一屏浏览 + 全局搜索 + 预览。
 *
 * 交互模型（类手机文件管理器）：
 * - 每屏只显示当前一层；点击目录进入、← 返回上级、面包屑任意跳转；
 * - 筛选框触发 Host 端全工作区搜索，点击结果目录直接进入；
 * - 单击文件在右侧预览（带行号 + 语法高亮 / 图片渲染），双击系统打开；
 * - 状态按会话持久化在插件级 store 中，切换“对话/轨迹/文件”标签后恢复。
 */
import * as React from 'react'
import type { ReactNode } from 'react'
import { detectLang, hlFor, tokenizeLine } from './highlight.js'
import { fileIcon, folderSvg } from './icons.js'
import { listDir, listRoot, readFile, searchFiles } from './rpc.js'
import type { Entry, WorkspacesService } from './types.js'

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

interface PreviewState {
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
  preview: PreviewState | null
  doc: DocState
  search: SearchState
}

const sessionStores = new Map<string, SessionStore>()
const loadedSids = new Set<string>()

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
      preview: null,
      doc: { phase: 'idle', kind: '', text: '', dataUrl: '', size: 0, truncated: false, error: '', forPath: '' },
      search: { phase: 'idle', query: '', matches: [], truncated: false },
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
  const [preview, setPreview] = React.useState<PreviewState | null>(store.preview)
  const [doc, setDoc] = React.useState<DocState>(store.doc)
  const [search, setSearch] = React.useState<SearchState>(store.search)

  // 状态镜像回 store（组件因标签切换卸载时，store 存活并恢复）。
  React.useEffect(() => { store.state = state }, [state, sid])
  React.useEffect(() => { store.dirData = dirData }, [dirData, sid])
  React.useEffect(() => { store.pending = pending }, [pending, sid])
  React.useEffect(() => { store.currentPath = currentPath }, [currentPath, sid])
  React.useEffect(() => { store.filter = filter }, [filter, sid])
  React.useEffect(() => { store.treeVisible = treeVisible }, [treeVisible, sid])
  React.useEffect(() => { store.preview = preview }, [preview, sid])
  React.useEffect(() => { store.doc = doc }, [doc, sid])
  React.useEffect(() => { store.search = search }, [search, sid])

  // 根目录列表：新会话全量重置；重进标签时静默刷新。
  React.useEffect(() => {
    const isNewSession = !loadedSids.has(sid)
    loadedSids.add(sid)
    if (isNewSession) {
      setDirData({})
      setPending({})
      setCurrentPath('')
      setPreview(null)
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

  // 预览加载：store 中同路径的已就绪内容直接复用。
  React.useEffect(() => {
    if (preview === null) {
      setDoc({ phase: 'idle', kind: '', text: '', dataUrl: '', size: 0, truncated: false, error: '', forPath: '' })
      return
    }
    if (store.doc.forPath === preview.path && store.doc.phase === 'ready') return
    let alive = true
    setDoc({ phase: 'loading', kind: '', text: '', dataUrl: '', size: 0, truncated: false, error: '', forPath: preview.path })
    readFile(sid, preview.path).then((res) => {
      if (!alive) return
      if (res.ok) {
        setDoc({
          phase: 'ready', kind: res.kind, text: res.text ?? '', dataUrl: res.dataUrl ?? '',
          size: res.size, truncated: res.truncated === true, error: '', forPath: preview.path,
        })
      } else {
        setDoc({ phase: 'error', kind: '', text: '', dataUrl: '', size: 0, truncated: false, error: res.error, forPath: preview.path })
      }
    }).catch(() => {
      if (alive) setDoc({ phase: 'error', kind: '', text: '', dataUrl: '', size: 0, truncated: false, error: 'UNKNOWN', forPath: preview.path })
    })
    return () => { alive = false }
  }, [preview, sid])

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
  const openPreview = (node: Entry): void => {
    setPreview({ path: node.path, abs: node.abs, name: node.name })
  }

  const isActive = (node: Entry): boolean => preview !== null && preview.path === node.path

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

  function renderPreviewBody(): ReactNode {
    if (preview === null) return React.createElement('div', { className: 'dshfm-center' }, '点击左侧文件进行预览，双击可在系统中打开')
    if (doc.phase === 'loading') return React.createElement('div', { className: 'dshfm-center' }, '加载中…')
    if (doc.phase === 'error') return React.createElement('div', { className: 'dshfm-center' }, '预览失败：' + (ERROR_TEXT[doc.error] ?? doc.error))
    if (doc.kind === 'text') {
      const hl = hlFor(detectLang(preview.name))
      const lines = doc.text.split('\n')
      const capped = lines.length > 3000
      const shown = capped ? lines.slice(0, 3000) : lines
      const gutter: ReactNode[] = []
      for (let i = 0; i < shown.length; i += 1) gutter.push(React.createElement('div', { className: 'dshfm-ln', key: i }, String(i + 1)))
      const codeLines = shown.map((line, i) => {
        let content: ReactNode = line
        if (hl !== null && line.length <= 2000) {
          const tokens = tokenizeLine(line, hl)
          content = tokens.map((t, j) => t.color === '' ? t.text : React.createElement('span', { key: j, style: { color: t.color } }, t.text))
        }
        return React.createElement('div', { className: 'dshfm-line', key: i }, content)
      })
      return React.createElement('div', { className: 'dshfm-code' },
        React.createElement('div', { className: 'dshfm-gutter' }, gutter),
        React.createElement('div', { className: 'dshfm-code-text' }, codeLines),
      )
    }
    if (doc.kind === 'image') {
      return React.createElement('div', { style: { padding: 12 } }, React.createElement('img', { className: 'dshfm-img', src: doc.dataUrl, alt: preview.name }))
    }
    return React.createElement('div', { className: 'dshfm-center' },
      React.createElement('div', null, '二进制文件，无法直接预览'),
      React.createElement('div', { style: { marginTop: 6 } }, fmtSize(doc.size)),
      React.createElement('button', { type: 'button', className: 'dshfm-btn', style: { marginTop: 14 }, onClick: () => openPath(preview.abs) }, '在系统中打开'),
    )
  }

  let note: ReactNode = null
  if (preview !== null && doc.phase === 'ready' && doc.kind === 'text' && (doc.truncated || doc.text.split('\n').length > 3000)) {
    note = React.createElement('div', { className: 'dshfm-note' }, '内容过长，仅预览前 256 KB')
  }

  return React.createElement('div', { className: 'dshfm-root', 'data-conversation-composer-overlay': '' },
    React.createElement('div', { className: 'dshfm-bar' },
      React.createElement('button', { type: 'button', className: treeVisible ? 'dshfm-btn dshfm-btn-on' : 'dshfm-btn', title: '显示/隐藏目录', onClick: () => setTreeVisible((v) => !v) }, '☰'),
      React.createElement('span', { className: 'dshfm-path', title: state.root }, state.root || '—'),
      React.createElement('input', { className: 'dshfm-input', value: filter, placeholder: '筛选…', onChange: (e) => setFilter(e.target.value) }),
      React.createElement('button', { type: 'button', className: 'dshfm-btn', onClick: () => setReloadKey((k) => k + 1) }, '刷新'),
      React.createElement('button', { type: 'button', className: 'dshfm-btn', onClick: openRoot, disabled: state.root === '' }, '打开目录'),
    ),
    React.createElement('div', { className: 'dshfm-main' },
      treeVisible ? React.createElement('div', { className: 'dshfm-tree' },
        React.createElement('div', { className: 'dshfm-tree-head' },
          React.createElement('button', { type: 'button', className: 'dshfm-btn dshfm-back', title: '返回上一级', disabled: currentPath === '', onClick: goUp }, '\u2190'),
          React.createElement('div', { className: 'dshfm-crumbs' }, renderCrumbs()),
        ),
        React.createElement('div', { className: 'dshfm-tree-body' }, treeBody),
      ) : null,
      React.createElement('div', { className: 'dshfm-preview' },
        React.createElement('div', { className: 'dshfm-preview-head' },
          React.createElement('span', { className: 'dshfm-preview-name' }, preview === null ? '预览' : preview.name),
          preview === null ? null : React.createElement('span', { className: 'dshfm-preview-meta', title: preview.path }, preview.path + (doc.size > 0 ? ' · ' + fmtSize(doc.size) : '')),
          React.createElement('span', { className: 'dshfm-preview-spacer' }),
          preview === null ? null : React.createElement('button', { type: 'button', className: 'dshfm-btn', onClick: () => openPath(preview.abs) }, '在系统中打开'),
          preview === null ? null : React.createElement('button', { type: 'button', className: 'dshfm-btn', onClick: () => setPreview(null) }, '关闭'),
        ),
        React.createElement('div', { className: 'dshfm-preview-body' }, renderPreviewBody()),
        note,
      ),
    ),
  )
}
