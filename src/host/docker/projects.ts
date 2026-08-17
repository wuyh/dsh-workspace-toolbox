/**
 * 工作区 Dockerfile 项目扫描：在会话工作区根下查找包含 Dockerfile 的
 * 项目目录（深度 ≤3、忽略噪音目录），供“构建/运行”联动使用。
 */
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const IGNORED = new Set([
  'node_modules', '.git', '.svn', '.hg', '.dsh', '__pycache__', '.venv',
  'venv', '.tox', '.cache', '.turbo', '.next', '.nuxt', '.pnpm',
  '.idea', '.vscode', '.DS_Store', 'dist', 'build', 'out', 'coverage',
])

export interface DockerProject {
  name: string
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

/** 扫描工作区根，返回含 Dockerfile 的项目目录列表（按名称排序）。 */
export function scanProjects(root: string, maxDepth = 3): DockerProject[] {
  const out: DockerProject[] = []
  const walk = (dir: string, rel: string, depth: number): void => {
    if (depth > maxDepth || out.length >= 50) return
    if (depth > 0 && hasDockerfile(dir)) {
      const name = rel.split('/').filter(Boolean).pop() ?? rel
      out.push({ name: rel === '' ? name : rel, dir, dockerfile: join(dir, 'Dockerfile') })
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
