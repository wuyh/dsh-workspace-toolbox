/**
 * 工作区 Vite 项目扫描：查找含 vite 依赖（package.json）或 vite 配置文件的
 * 前端项目目录（深度 ≤5、忽略噪音目录），供“启动/停止”管控使用。
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const IGNORED = new Set([
  'node_modules', '.git', '.svn', '.hg', '.dsh', '__pycache__', '.venv',
  'venv', '.tox', '.cache', '.turbo', '.next', '.nuxt', '.pnpm',
  '.idea', '.vscode', '.DS_Store', 'dist', 'build', 'out', 'coverage',
])

const VITE_CONFIG_NAMES = [
  'vite.config.ts', 'vite.config.mts', 'vite.config.cts',
  'vite.config.js', 'vite.config.mjs', 'vite.config.cjs',
]

export interface ViteProject {
  /** 目录名（用于展示）。 */
  name: string
  /** 相对工作区根（也是运行 key）。 */
  rel: string
  /** 绝对路径。 */
  dir: string
  /** package.json 的 dev 脚本（如 "vite" / "vite --host"），无则空串。 */
  devScript: string
  /** 命中的 vite 配置文件（相对 dir），无则空串。 */
  configFile: string
}

function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

function findViteConfig(dir: string): string {
  for (const name of VITE_CONFIG_NAMES) {
    try {
      if (statSync(join(dir, name)).isFile()) return name
    } catch {
      // 下一个候选
    }
  }
  return ''
}

function readPackageMeta(dir: string): { hasVite: boolean, devScript: string } {
  try {
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, unknown>
      devDependencies?: Record<string, unknown>
      scripts?: Record<string, unknown>
    }
    const deps = {
      ...(pkg.dependencies ?? {}),
      ...(pkg.devDependencies ?? {}),
    }
    const hasVite = typeof deps['vite'] === 'string'
      || typeof deps['@vitejs/plugin-vue'] === 'string'
      || typeof deps['@vitejs/plugin-react'] === 'string'
    const devScript = typeof pkg.scripts?.dev === 'string' ? pkg.scripts.dev : ''
    return { hasVite, devScript }
  } catch {
    return { hasVite: false, devScript: '' }
  }
}

/** 扫描工作区根，返回 Vite 项目目录列表（按名称排序）。 */
export function scanViteProjects(root: string, maxDepth = 5): ViteProject[] {
  const out: ViteProject[] = []
  const walk = (dir: string, rel: string, depth: number): void => {
    if (depth > maxDepth || out.length >= 50) return
    if (depth > 0) {
      const { hasVite, devScript } = readPackageMeta(dir)
      const configFile = findViteConfig(dir)
      if (hasVite || configFile !== '') {
        const name = rel.split('/').filter(Boolean).pop() ?? rel
        out.push({ name: rel === '' ? name : rel, rel, dir, devScript, configFile })
        return
      }
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
