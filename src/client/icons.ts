/**
 * 文件类型图标：文件夹 + “文件页轮廓 + 彩色类型缩写”的 VS Code 风格图标。
 */
import * as React from 'react'
import type { ReactNode } from 'react'

export function folderSvg(className: string): ReactNode {
  return React.createElement('svg', { className, width: 14, height: 14, viewBox: '0 0 16 16', 'aria-hidden': true },
    React.createElement('path', {
      d: 'M1.5 3.5A1.5 1.5 0 0 1 3 2h3.2c.4 0 .78.16 1.06.44L8.5 3.7h4.5A1.5 1.5 0 0 1 14.5 5.2v7.3a1.5 1.5 0 0 1-1.5 1.5H3a1.5 1.5 0 0 1-1.5-1.5z',
      fill: 'currentColor',
    }))
}

interface Glyph {
  label: string
  color: string
}

function glyph(label: string, color: string): Glyph {
  return { label, color }
}

/** 按扩展名（或特殊文件名）映射类型缩写与主题色。 */
export function fileGlyph(name: string): Glyph {
  const dot = name.lastIndexOf('.')
  const ext = dot < 0 ? '' : name.slice(dot + 1).toLowerCase()
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif'].includes(ext)) return glyph('IMG', '#4fc1e9')
  if (['zip', 'tar', 'gz', 'bz2', 'xz', '7z', 'rar', 'tgz'].includes(ext)) return glyph('ZIP', '#d39a62')
  if (['json', 'jsonl', 'jsonc'].includes(ext)) return glyph('{}', '#cbcb41')
  if (['yaml', 'yml', 'toml'].includes(ext)) return glyph('YM', '#a181f7')
  if (['xml', 'plist'].includes(ext)) return glyph('XM', '#e8995e')
  if (['md', 'markdown', 'mdown'].includes(ext)) return glyph('MD', '#519aba')
  if (['txt', 'text', 'log'].includes(ext)) return glyph('TX', '#8b9bb4')
  if (['js', 'mjs', 'cjs'].includes(ext)) return glyph('JS', '#f7df1e')
  if (ext === 'jsx') return glyph('JX', '#f7df1e')
  if (ext === 'ts') return glyph('TS', '#3178c6')
  if (ext === 'tsx') return glyph('T+', '#3178c6')
  if (ext === 'py') return glyph('PY', '#3776ab')
  if (ext === 'go') return glyph('GO', '#00add8')
  if (ext === 'rs') return glyph('RS', '#dea584')
  if (ext === 'java') return glyph('JA', '#b07219')
  if (ext === 'kt' || ext === 'kts') return glyph('KT', '#7f52ff')
  if (ext === 'c' || ext === 'h') return glyph('C', '#a8b9cc')
  if (['cpp', 'cc', 'cxx', 'hpp', 'hh'].includes(ext)) return glyph('C+', '#a8b9cc')
  if (ext === 'cs') return glyph('C#', '#68217a')
  if (ext === 'rb') return glyph('RB', '#cc342d')
  if (ext === 'php') return glyph('PH', '#777bb4')
  if (ext === 'swift') return glyph('SW', '#ff7f50')
  if (['sh', 'bash', 'zsh', 'fish'].includes(ext)) return glyph('SH', '#89e051')
  if (ext === 'sql') return glyph('SQ', '#e38c00')
  if (ext === 'vue') return glyph('VU', '#42b883')
  if (ext === 'svelte') return glyph('SV', '#ff3e00')
  if (ext === 'css') return glyph('CS', '#42a5f5')
  if (['scss', 'sass', 'less'].includes(ext)) return glyph('SC', '#c6538c')
  if (ext === 'html' || ext === 'htm') return glyph('HT', '#e44d26')
  if (['ini', 'cfg', 'conf', 'env', 'properties'].includes(ext)) return glyph('CF', '#a181f7')
  if (ext === 'lock') return glyph('LK', '#8b8b8b')
  if (ext === 'pdf') return glyph('PD', '#d53f3f')
  if (['doc', 'docx'].includes(ext)) return glyph('DO', '#2b579a')
  if (['xls', 'xlsx', 'csv'].includes(ext)) return glyph('XL', '#217346')
  if (['ppt', 'pptx'].includes(ext)) return glyph('PP', '#d24726')
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) return glyph('AU', '#a56cc1')
  if (['mp4', 'mov', 'mkv', 'avi', 'webm'].includes(ext)) return glyph('VI', '#7b52ab')
  if (name === 'Dockerfile') return glyph('DK', '#2496ed')
  if (name === 'LICENSE' || name === 'LICENSE.md') return glyph('LI', '#8b9bb4')
  return glyph('', '#8b9bb4')
}

export function fileIcon(name: string): ReactNode {
  const g = fileGlyph(name)
  return React.createElement('svg', { className: 'dshfm-icon', width: 16, height: 16, viewBox: '0 0 16 16', 'aria-hidden': true },
    React.createElement('path', {
      d: 'M4.5 1.5h4.4l3.6 3.6v8.9a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V2.5a1 1 0 0 1 1-1z',
      fill: 'none', stroke: 'currentColor', strokeWidth: 1.2,
    }),
    g.label === '' ? null : React.createElement('text', {
      x: 8, y: 11.6, textAnchor: 'middle', fontSize: 5.4, fontWeight: 700, fill: g.color,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    }, g.label),
  )
}
