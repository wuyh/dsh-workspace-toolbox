// Build the browser half of the plugin (client bundle) in-process, then wrap
// it in the official `window.__ModuleLoader__.load({ id, factory })`
// registration so client-modules can mount it.
//
// WHY in-process: esbuild's native service worker spawns a subprocess over an
// IPC pipe, which the DSH file sandbox blocks (EPERM). This bundler instead
// uses the TypeScript compiler API (pure JS, no subprocess) to transpile the
// self-contained client module graph to CommonJS and inline it into a single
// factory.
//
// Dependency policy:
// - relative imports (src/client/*.ts, src/contract.ts) are always inlined;
// - third-party libraries in the INLINE_PACKAGES allowlist (highlight.js,
//   marked, dompurify) are resolved through node_modules and inlined too —
//   so the bundle never depends on runtime bare-module resolution;
// - everything else (currently `react`) passes through to the outer
//   ModuleLoader resolver, keeping a single shared React instance.
//
// Based on the equivalent build script of dsh-input-plus (MIT License).
//
// Usage:
//   node scripts/build-client.mjs          # write lib/client.js
//   node scripts/build-client.mjs --check  # verify lib/client.js is fresh
//
// New client modules under src/client are picked up automatically by the
// graph walk.

import { createRequire } from 'node:module'
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const ts = require('typescript')

const ROOT = resolve(import.meta.dirname, '..')
const ENTRY = resolve(ROOT, 'src', 'client', 'index.ts')
const OUTPUT = resolve(ROOT, 'lib', 'client.js')
const PLUGIN_ID = 'dsh-workspace-toolbox'

/** 允许内联进 bundle 的第三方包（其余 specifier 透传给外层 ModuleLoader）。 */
const INLINE_PACKAGES = new Set(['highlight.js', 'marked', 'dompurify', 'xterm', '@xterm/addon-fit'])

/** 'highlight.js/lib/core' → 'highlight.js'；'@scope/pkg/sub' → '@scope/pkg'。 */
function packageOf(spec) {
  if (spec.startsWith('@')) {
    const parts = spec.split('/')
    return parts.length >= 2 ? parts[0] + '/' + parts[1] : spec
  }
  return spec.split('/')[0] ?? spec
}

const TS_IMPORT_RE = /(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g
const CJS_REQUIRE_RE = /require\((['"])([^'"]+)\1\)/g

function tryFile(cand) {
  for (const p of [cand, cand + '.js', cand + '.cjs', cand + '.mjs', cand + '.json']) {
    try {
      if (statSync(p).isFile()) return p
    } catch {
      // try next
    }
  }
  try {
    if (statSync(cand).isDirectory()) {
      try {
        const pkg = JSON.parse(readFileSync(join(cand, 'package.json'), 'utf8'))
        if (typeof pkg.main === 'string') {
          const main = tryFile(resolve(cand, pkg.main))
          if (main !== null) return main
        }
      } catch {
        // fall through to index
      }
      return tryFile(join(cand, 'index'))
    }
  } catch {
    // not a directory
  }
  return null
}

/** Node 风格解析：相对路径按 .ts/.tsx 查盘，裸 specifier 走 node_modules。 */
function resolveSpecifier(fromFile, spec) {
  if (spec.startsWith('.')) {
    const base = spec.replace(/\.(js|mjs|cjs)$/, '')
    const dir = dirname(fromFile)
    for (const ext of ['.ts', '.tsx']) {
      const cand = resolve(dir, base + ext)
      try {
        statSync(cand)
        return cand
      } catch {
        // try next
      }
    }
    return null
  }
  if (!INLINE_PACKAGES.has(packageOf(spec))) return null
  let dir = dirname(fromFile)
  for (let hops = 0; hops < 16; hops += 1) {
    const hit = tryFile(join(dir, 'node_modules', spec))
    if (hit !== null) return hit
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

/** Transpile one module (TS or JS) to a CommonJS module body string. */
function transpile(fileAbs) {
  const src = readFileSync(fileAbs, 'utf8')
  const out = ts.transpileModule(src, {
    fileName: fileAbs,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      isolatedModules: true,
    },
  })
  return out.outputText
}

/** 收集模块图（含内联的第三方包）。返回节点顺序、边表（specifier → 目标节点）。 */
function collectGraph() {
  const order = [] // fileAbs; id = position in order
  const index = new Map()
  const edges = new Map() // file → Map(spec → targetFile)
  const queue = [ENTRY]
  index.set(ENTRY, -1)

  const scan = (src, sink) => {
    TS_IMPORT_RE.lastIndex = 0
    let m
    while ((m = TS_IMPORT_RE.exec(src)) !== null) sink(m[1])
    CJS_REQUIRE_RE.lastIndex = 0
    while ((m = CJS_REQUIRE_RE.exec(src)) !== null) sink(m[2])
  }

  while (queue.length > 0) {
    const file = queue.shift()
    if (index.get(file) !== -1) continue
    const id = order.length
    index.set(file, id)
    order.push(file)
    const src = readFileSync(file, 'utf8')
    const fileEdges = new Map()
    edges.set(file, fileEdges)
    scan(src, (spec) => {
      if (fileEdges.has(spec)) return
      const target = resolveSpecifier(file, spec)
      if (target === null) return
      fileEdges.set(spec, target)
      if (!index.has(target)) {
        index.set(target, -1)
        queue.push(target)
      }
    })
  }

  const deps = []
  for (const file of order) {
    const fileEdges = edges.get(file) ?? new Map()
    const set = new Set()
    for (const target of fileEdges.values()) {
      const tid = index.get(target)
      if (tid !== undefined && tid !== index.get(file)) set.add(tid)
    }
    deps.push(set)
  }
  return { order, deps, edges }
}

/** Post-order visitation producing a stable module list (deps before dependents). */
function postOrder(order, deps) {
  const result = []
  const seen = new Set()
  const visit = (id) => {
    if (seen.has(id)) return
    seen.add(id)
    for (const d of deps[id] ?? []) visit(d)
    result.push(id)
  }
  for (let i = 0; i < order.length; i += 1) visit(i)
  return result
}

/**
 * @param {{ check?: boolean }} opts
 * @returns {{ ok: boolean, errors?: string[] }}
 */
export function generate({ check = false } = {}) {
  try {
    const { order, deps, edges } = collectGraph()
    const list = postOrder(order, deps) // module ids in post order
    const posOf = new Map(list.map((id, pos) => [id, pos]))

    const factories = list.map((id) => {
      const file = order[id]
      const transpiled = transpile(file)
      const fileEdges = edges.get(file) ?? new Map()
      const body = transpiled.replace(CJS_REQUIRE_RE, (all, quote, spec) => {
        const target = fileEdges.has(spec) ? fileEdges.get(spec) : resolveSpecifier(file, spec)
        const tid = target === null ? undefined : order.indexOf(target)
        const pos = tid === undefined ? undefined : posOf.get(tid)
        return pos === undefined ? all : `require(${pos})`
      })
      return `  (function (module, exports, require) {\n${indent(body, 2)}\n  })`
    })

    const entryPos = posOf.get(0)
    const loader = [
      `window.__ModuleLoader__.load({`,
      `  id: ${JSON.stringify(PLUGIN_ID)},`,
      `  factory: (require) => {`,
      `    var cache = {};`,
      `    var factories = [`,
      factories.join(',\n'),
      `    ];`,
      `    function __r(id) {`,
      `      if (typeof id !== 'number') return require(id);`,
      `      if (cache[id]) return cache[id].exports;`,
      `      var module = { exports: {} };`,
      `      cache[id] = module;`,
      `      factories[id](module, module.exports, __r);`,
      `      return module.exports;`,
      `    }`,
      `    return __r(${entryPos});`,
      `  }`,
      `});`,
      '',
    ].join('\n')

    if (!check) {
      mkdirSync(dirname(OUTPUT), { recursive: true })
      writeFileSync(OUTPUT, loader)
      return { ok: true }
    }
    let committed = null
    try {
      committed = readFileSync(OUTPUT, 'utf8')
    } catch {
      return { ok: false, errors: [OUTPUT + ' does not exist: run node scripts/build-client.mjs'] }
    }
    if (committed !== loader) {
      return { ok: false, errors: ['client.js is stale: run node scripts/build-client.mjs (do not hand-edit generated output)'] }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, errors: ['bundle failed: ' + (e instanceof Error ? e.stack ?? e.message : String(e))] }
  }
}

function indent(text, spaces) {
  const pad = ' '.repeat(spaces)
  return text.split('\n').map((l) => (l === '' ? l : pad + l)).join('\n')
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const check = process.argv.includes('--check')
  const result = generate({ check })
  if (!result.ok) {
    for (const e of result.errors ?? []) console.error('[build-client] ' + e)
    process.exit(1)
  }
  console.log(check ? '[build-client] client.js is fresh (--check OK)' : '[build-client] client.js written')
}
