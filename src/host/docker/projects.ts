/**
 * 工作区 Dockerfile 项目扫描与已添加项目持久化。
 *
 * - `scanProjects`：浅层自动扫描（深度 ≤3），构建下拉直接使用；
 * - `scanAllDockerfileModules`：深层全量候选扫描（深度 ≤8、上限 100），
 *   供「＋ 添加」按钮识别工作区中所有含 Dockerfile 的模块；
 * - 已添加项目按工作区相对路径持久化到 ~/.dsh/storages 下的 JSON 文件，
 *   重启后保留；目录被删/不再含 Dockerfile 时自动剔除。
 */
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const IGNORED = new Set([
  'node_modules', '.git', '.svn', '.hg', '.dsh', '__pycache__', '.venv',
  'venv', '.tox', '.cache', '.turbo', '.next', '.nuxt', '.pnpm',
  '.idea', '.vscode', '.DS_Store', 'dist', 'build', 'out', 'coverage',
])

/** 已添加项目的持久化路径（与 docker 连接元数据同级）。 */
const ADDED_STORE = join(homedir(), '.dsh', 'storages', 'dsh-workspace-toolbox', 'docker-projects.json')

export interface DockerProject {
  name: string
  /** 相对工作区根的路径（唯一标识）。 */
  rel: string
  dir: string
  dockerfile: string
}

function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

function hasDockerfile(dir: string): boolean {
  try {
    for (const name of readdirSync(dir)) {
      if (name.toLowerCase() === 'dockerfile') return true
    }
  } catch {
    // 不可读目录忽略
  }
  return false
}

function toProject(rel: string, dir: string): DockerProject {
  const name = rel.split('/').filter(Boolean).pop() ?? rel
  return { name: rel === '' ? name : rel, rel, dir, dockerfile: join(dir, 'Dockerfile') }
}

/** 浅层自动扫描（构建下拉直接使用）。 */
export function scanProjects(root: string, maxDepth = 3): DockerProject[] {
  const out: DockerProject[] = []
  const walk = (dir: string, rel: string, depth: number): void => {
    if (depth > maxDepth || out.length >= 50) return
    if (depth > 0 && hasDockerfile(dir)) {
      out.push(toProject(rel, dir))
      return
    }
    let entries: string[]
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }
    for (const entry of entries) {
      if (IGNORED.has(entry)) continue
      const child = join(dir, entry)
      if (!isDirectory(child)) continue
      walk(child, rel === '' ? entry : rel + '/' + entry, depth + 1)
    }
  }
  walk(root, '', 0)
  out.sort((a, b) => a.name.localeCompare(b.name))
  return out
}

/** 深层全量候选扫描：工作区中所有含 Dockerfile 的模块（含嵌套）。 */
export function scanAllDockerfileModules(root: string, maxDepth = 8, cap = 100): DockerProject[] {
  const out: DockerProject[] = []
  const walk = (dir: string, rel: string, depth: number): void => {
    if (depth > maxDepth || out.length >= cap) return
    if (depth > 0 && hasDockerfile(dir)) out.push(toProject(rel, dir))
    let entries: string[]
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }
    for (const entry of entries) {
      if (IGNORED.has(entry)) continue
      const child = join(dir, entry)
      if (!isDirectory(child)) continue
      walk(child, rel === '' ? entry : rel + '/' + entry, depth + 1)
    }
  }
  walk(root, '', 0)
  out.sort((a, b) => a.name.localeCompare(b.name))
  return out
}

function loadAddedRels(): string[] {
  try {
    const parsed = JSON.parse(readFileSync(ADDED_STORE, 'utf8')) as unknown
    if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === 'string')
  } catch {
    // 首次运行或文件损坏
  }
  return []
}

function saveAddedRels(rels: string[]): void {
  try {
    mkdirSync(join(ADDED_STORE, '..'), { recursive: true })
    writeFileSync(ADDED_STORE, JSON.stringify(rels, null, 2))
  } catch {
    // 持久化失败不影响本次会话
  }
}

/** 合并列表：浅层自动扫描 ∪ 已添加（目录被删/不再含 Dockerfile 的自动剔除）。 */
export function listWorkspaceProjects(root: string): DockerProject[] {
  const auto = scanProjects(root)
  const seen = new Set(auto.map((p) => p.rel))
  const out = [...auto]
  for (const rel of loadAddedRels()) {
    if (seen.has(rel)) continue
    const abs = join(root, rel)
    if (!isDirectory(abs) || !hasDockerfile(abs)) continue
    out.push(toProject(rel, abs))
    seen.add(rel)
  }
  out.sort((a, b) => a.name.localeCompare(b.name))
  return out
}

/** 添加一个项目（相对路径）到持久化列表；返回更新后的合并列表。 */
export function addWorkspaceProject(root: string, rel: string): { ok: true, projects: DockerProject[] } | { ok: false, error: string } {
  const clean = rel.replace(/^[\\/]+/, '')
  if (clean === '' || clean.includes('..') || clean.includes(':')) return { ok: false, error: 'INVALID_DIR' }
  const abs = join(root, clean)
  if (!isDirectory(abs)) return { ok: false, error: 'NOT_FOUND' }
  if (!hasDockerfile(abs)) return { ok: false, error: 'NO_DOCKERFILE' }
  const rels = loadAddedRels()
  if (!rels.includes(clean)) {
    rels.push(clean)
    saveAddedRels(rels)
  }
  return { ok: true, projects: listWorkspaceProjects(root) }
}
