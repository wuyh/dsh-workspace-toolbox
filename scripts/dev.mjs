// 开发监视器：监听 src/ 变化，防抖后重建 Host（tsc）与浏览器 bundle
// （scripts/build-client.mjs）。配合 profile 里的 link 安装与 client-hmr：
// - 改 src/client/* → 自动重建 → 页面端 SSE 热替换模块，无需刷新、无需重启；
// - 改 src/host/* 或 src/index.ts → 自动重建，但 Host 模块仍需重启 dsh web 生效。
//
// Usage:
//   node scripts/dev.mjs
//   node scripts/dev.mjs --once   # build once and exit

import { spawnSync } from 'node:child_process'
import { watch } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const SRC = resolve(ROOT, 'src')

const once = process.argv.includes('--once')

function build() {
  const started = Date.now()
  const result = spawnSync('tsc', ['-p', 'tsconfig.build.json'], { cwd: ROOT, stdio: 'pipe' })
  if (result.status !== 0) {
    process.stderr.write('[dev] tsc failed:\n' + String(result.stderr) + '\n')
    return
  }
  const bundle = spawnSync('node', ['scripts/build-client.mjs'], { cwd: ROOT, stdio: 'pipe' })
  if (bundle.status !== 0) {
    process.stderr.write('[dev] build-client failed:\n' + String(bundle.stderr) + '\n')
    return
  }
  console.log(`[dev] built in ${Date.now() - started}ms (host + client bundle)`)
}

if (once) {
  build()
  process.exit(0)
}

let timer = null
const schedule = () => {
  if (timer !== null) clearTimeout(timer)
  timer = setTimeout(() => {
    timer = null
    build()
  }, 300)
}

console.log('[dev] watching ' + SRC)
watch(SRC, { recursive: true }, (event, filename) => {
  if (filename === null || filename === undefined) return
  if (!/\.(ts|tsx)$/.test(String(filename))) return
  console.log(`[dev] change: ${filename}`)
  schedule()
})
