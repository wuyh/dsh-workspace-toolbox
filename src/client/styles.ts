/**
 * 插件自有样式与注入。
 *
 * 颜色全部走 DSH 主题变量（--dsw-alias-*），自动跟随明暗主题；
 * 样式标签带 data-plugin 标记，幂等注入一次。
 */

export const CSS = `
  .dshfm-root { height: 100%; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
  .dshfm-bar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-bottom: 1px solid var(--dsw-alias-border-l2); flex: none; }
  .dshfm-path { flex: 1; min-width: 0; font-family: var(--ds-font-family-code); font-size: 12px; color: var(--dsw-alias-label-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dshfm-btn { flex: none; display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; font-size: 12px; line-height: 16px; color: var(--dsw-alias-label-secondary); background: transparent; border: 1px solid var(--dsw-alias-border-l2); border-radius: 6px; cursor: pointer; }
  .dshfm-btn:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
  .dshfm-btn:disabled { opacity: 0.45; cursor: default; }
  .dshfm-btn-on { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }
  .dshfm-input { flex: none; width: 140px; padding: 4px 8px; font-size: 12px; color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base); border: 1px solid var(--dsw-alias-border-l2); border-radius: 6px; outline: none; }
  .dshfm-input:focus { border-color: var(--dsw-alias-interactive-bg-hover); }
  .dshfm-main { flex: 1; min-height: 0; min-width: 0; display: flex; overflow: hidden; }
  .dshfm-tree { flex: none; width: 280px; min-width: 0; min-height: 0; display: flex; flex-direction: column; overflow: hidden; border-right: 1px solid var(--dsw-alias-border-l2); }
  .dshfm-tree-head { flex: none; display: flex; align-items: center; gap: 4px; padding: 6px 8px; border-bottom: 1px solid var(--dsw-alias-border-l2); }
  .dshfm-back { padding: 2px 8px; }
  .dshfm-crumbs { flex: 1; min-width: 0; display: flex; align-items: center; gap: 2px; overflow-x: auto; overscroll-behavior: contain; white-space: nowrap; }
  .dshfm-crumb { flex: none; border: none; background: transparent; padding: 2px 6px; border-radius: 4px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); cursor: pointer; white-space: nowrap; }
  .dshfm-crumb:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
  .dshfm-crumb:disabled { cursor: default; color: var(--dsw-alias-label-primary); font-weight: 500; }
  .dshfm-crumb-sep { flex: none; color: var(--dsw-alias-label-tertiary); font-size: 11px; }
  .dshfm-tree-body { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; padding: 4px 0 96px; }
  .dshfm-preview { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
  .dshfm-tabs { flex: none; display: flex; align-items: flex-end; gap: 3px; padding: 6px 8px 0; border-bottom: 1px solid var(--dsw-alias-border-l2); overflow-x: auto; overflow-y: hidden; overscroll-behavior: contain; }
  .dshfm-tab { flex: none; display: flex; align-items: center; gap: 6px; max-width: 180px; padding: 4px 6px 4px 10px; font-size: 12px; line-height: 18px; border: 1px solid var(--dsw-alias-border-l2); border-bottom: none; border-radius: 8px 8px 0 0; color: var(--dsw-alias-label-secondary); cursor: pointer; background: transparent; }
  .dshfm-tab:hover { background: var(--dsw-alias-interactive-bg-hover); }
  .dshfm-tab-active { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base); font-weight: 500; }
  .dshfm-tab-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .dshfm-tab-close { flex: none; border: none; background: transparent; color: var(--dsw-alias-label-tertiary); cursor: pointer; font-size: 13px; line-height: 1; padding: 0 3px; border-radius: 4px; }
  .dshfm-tab-close:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
  .dshfm-preview-head { flex: none; display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-bottom: 1px solid var(--dsw-alias-border-l2); }
  .dshfm-preview-name { font-size: 13px; font-weight: 500; color: var(--dsw-alias-label-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dshfm-preview-meta { flex: none; font-size: 11px; color: var(--dsw-alias-label-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dshfm-preview-spacer { flex: 1; }
  .dshfm-preview-body { flex: 1; min-height: 0; overflow: auto; overscroll-behavior: contain; padding-bottom: 96px; background: var(--dsw-alias-bg-base); }
  .dshfm-code { display: flex; min-width: 100%; width: max-content; font-family: var(--ds-font-family-code); font-size: 12px; }
  .dshfm-gutter { flex: none; padding: 10px 0; text-align: right; color: var(--dsw-alias-label-dimmed); user-select: none; border-right: 1px solid var(--dsw-alias-border-l2); }
  .dshfm-ln { line-height: 18px; padding: 0 10px 0 14px; }
  .dshfm-code-text { padding: 10px 16px; }
  .dshfm-code-pre { margin: 0; font: inherit; line-height: 18px; white-space: pre; }

  /* highlight.js token 主题（VS Code Dark+ 近似配色） */
  .dshfm-code-pre .hljs-comment, .dshfm-code-pre .hljs-quote { color: #6a9955; font-style: italic; }
  .dshfm-code-pre .hljs-keyword, .dshfm-code-pre .hljs-selector-tag, .dshfm-code-pre .hljs-doctag, .dshfm-code-pre .hljs-formula { color: #c586c0; }
  .dshfm-code-pre .hljs-string, .dshfm-code-pre .hljs-regexp, .dshfm-code-pre .hljs-addition { color: #ce9178; }
  .dshfm-code-pre .hljs-number, .dshfm-code-pre .hljs-literal { color: #b5cea8; }
  .dshfm-code-pre .hljs-title, .dshfm-code-pre .hljs-section, .dshfm-code-pre .hljs-title.function_ { color: #dcdcaa; }
  .dshfm-code-pre .hljs-built_in, .dshfm-code-pre .hljs-type, .dshfm-code-pre .hljs-class .hljs-title, .dshfm-code-pre .hljs-title.class_ { color: #4ec9b0; }
  .dshfm-code-pre .hljs-attr, .dshfm-code-pre .hljs-attribute, .dshfm-code-pre .hljs-variable, .dshfm-code-pre .hljs-template-variable, .dshfm-code-pre .hljs-name, .dshfm-code-pre .hljs-tag { color: #9cdcfe; }
  .dshfm-code-pre .hljs-symbol, .dshfm-code-pre .hljs-bullet, .dshfm-code-pre .hljs-link, .dshfm-code-pre .hljs-meta, .dshfm-code-pre .hljs-params { color: #569cd6; }
  .dshfm-code-pre .hljs-deletion { color: #f44747; }
  .dshfm-code-pre .hljs-emphasis { font-style: italic; }
  .dshfm-code-pre .hljs-strong { font-weight: 700; }

  /* Markdown 渲染视图 */
  .dshfm-md { padding: 16px 22px 32px; font-size: 13px; line-height: 1.7; color: var(--dsw-alias-label-primary); max-width: 880px; }
  .dshfm-md h1, .dshfm-md h2, .dshfm-md h3, .dshfm-md h4, .dshfm-md h5, .dshfm-md h6 { margin: 18px 0 10px; font-weight: 600; line-height: 1.4; }
  .dshfm-md h1 { font-size: 20px; border-bottom: 1px solid var(--dsw-alias-border-l2); padding-bottom: 8px; }
  .dshfm-md h2 { font-size: 17px; border-bottom: 1px solid var(--dsw-alias-border-l2); padding-bottom: 6px; }
  .dshfm-md h3 { font-size: 15px; }
  .dshfm-md p { margin: 8px 0; }
  .dshfm-md code { background: var(--dsw-alias-markdown-code-block); padding: 2px 6px; border-radius: 4px; font-family: var(--ds-font-family-code); font-size: 12px; }
  .dshfm-md pre { background: var(--dsw-alias-markdown-code-block); padding: 12px 14px; border-radius: 8px; overflow: auto; margin: 10px 0; }
  .dshfm-md pre code { background: none; padding: 0; white-space: pre; }
  .dshfm-md a { color: var(--dsw-alias-state-business-primary); text-decoration: none; }
  .dshfm-md a:hover { text-decoration: underline; }
  .dshfm-md blockquote { border-left: 3px solid var(--dsw-alias-border-l2); margin: 10px 0; padding: 2px 14px; color: var(--dsw-alias-label-secondary); }
  .dshfm-md ul, .dshfm-md ol { padding-left: 24px; margin: 8px 0; }
  .dshfm-md li { margin: 3px 0; }
  .dshfm-md table { border-collapse: collapse; margin: 12px 0; }
  .dshfm-md th, .dshfm-md td { border: 1px solid var(--dsw-alias-border-l2); padding: 5px 12px; }
  .dshfm-md th { background: var(--dsw-alias-interactive-bg-hover); font-weight: 600; }
  .dshfm-md img { max-width: 100%; border-radius: 6px; }
  .dshfm-md hr { border: none; border-top: 1px solid var(--dsw-alias-border-l2); margin: 16px 0; }
  .dshfm-img { max-width: 100%; max-height: 70vh; display: block; margin: 16px auto; border-radius: 6px; }
  .dshfm-center { padding: 48px 16px; text-align: center; color: var(--dsw-alias-label-tertiary); font-size: 12px; }
  .dshfm-note { flex: none; padding: 6px 12px; font-size: 11px; color: var(--dsw-alias-label-tertiary); border-top: 1px solid var(--dsw-alias-border-l2); }
  .dshfm-row { display: flex; align-items: center; gap: 6px; padding: 2px 10px; font-size: 13px; line-height: 26px; cursor: pointer; user-select: none; }
  .dshfm-row:hover { background: var(--dsw-alias-interactive-bg-hover); }
  .dshfm-row-active { background: var(--dsw-alias-interactive-bg-hover); }
  .dshfm-icon { flex: none; width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; color: var(--dsw-alias-label-tertiary); }
  .dshfm-icon-folder { color: #f2a51a; }
  .dshfm-chev { flex: none; width: 12px; height: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; color: var(--dsw-alias-label-tertiary); }
  .dshfm-name { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--dsw-alias-label-primary); }
  .dshfm-size { flex: none; font-size: 11px; color: var(--dsw-alias-label-tertiary); }
  .dshfm-docker-wrap { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
  .dshfm-docker-wrap .dshdc-main { height: 100%; }

  /* Docker 服务视图 */
  .dshdc-root { height: 100%; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
  .dshdc-main { flex: 1; min-height: 0; min-width: 0; display: flex; overflow: hidden; }
  .dshdc-side { flex: none; width: 280px; min-width: 0; min-height: 0; display: flex; flex-direction: column; overflow-y: auto; overscroll-behavior: contain; border-right: 1px solid var(--dsw-alias-border-l2); }
  .dshdc-side-head { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 12px 4px; font-size: 12px; font-weight: 500; color: var(--dsw-alias-label-secondary); }
  .dshdc-side-list { flex: none; overflow: visible; padding: 2px 6px 8px; }
  .dshdc-form { flex: none; display: flex; flex-direction: column; gap: 6px; padding: 4px 10px 10px; border-bottom: 1px solid var(--dsw-alias-border-l2); }
  .dshdc-error { font-size: 11px; color: var(--dsw-alias-state-error-primary); line-height: 1.5; }
  .dshdc-row { display: flex; align-items: center; gap: 8px; padding: 4px 8px; border-radius: 6px; cursor: pointer; }
  .dshdc-row:hover { background: var(--dsw-alias-interactive-bg-hover); }
  .dshdc-row-active { background: var(--dsw-alias-interactive-bg-hover); }
  .dshdc-row-main { flex: 1; min-width: 0; }
  .dshdc-row-name { font-size: 13px; color: var(--dsw-alias-label-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dshdc-row-sub { font-size: 11px; color: var(--dsw-alias-label-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dshdc-row-actions { flex: none; display: flex; gap: 4px; }
  .dshdc-dot { flex: none; font-size: 9px; color: var(--dsw-alias-label-tertiary); }
  .dshdc-dot-on { color: var(--dsw-alias-state-business-primary); }
  .dshdc-body { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
  .dshdc-bar { flex: none; display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-bottom: 1px solid var(--dsw-alias-border-l2); }
  .dshdc-title { font-size: 14px; font-weight: 600; color: var(--dsw-alias-label-primary); }
  .dshdc-spacer { flex: 1; }
  .dshdc-actions { flex: none; display: flex; align-items: center; flex-wrap: wrap; gap: 6px; padding: 8px 12px; border-bottom: 1px solid var(--dsw-alias-border-l2); }
  .dshdc-actions-label { font-size: 12px; color: var(--dsw-alias-label-secondary); }
  .dshdc-sep { width: 1px; height: 18px; background: var(--dsw-alias-border-l2); margin: 0 4px; }
  .dshdc-input { padding: 4px 8px; font-size: 12px; color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base); border: 1px solid var(--dsw-alias-border-l2); border-radius: 6px; outline: none; box-sizing: border-box; }
  .dshdc-input:focus { border-color: var(--dsw-alias-interactive-bg-hover); }
  .dshdc-btn { flex: none; display: inline-flex; align-items: center; padding: 4px 10px; font-size: 12px; line-height: 16px; color: var(--dsw-alias-label-secondary); background: transparent; border: 1px solid var(--dsw-alias-border-l2); border-radius: 6px; cursor: pointer; }
  .dshdc-btn:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
  .dshdc-btn:disabled { opacity: 0.45; cursor: default; }
  .dshdc-btn-on { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }
  .dshdc-mini { flex: none; border: none; background: transparent; color: var(--dsw-alias-label-secondary); font-size: 11px; cursor: pointer; padding: 2px 6px; border-radius: 4px; }
  .dshdc-mini:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
  .dshdc-content { flex: 1; min-height: 0; overflow: auto; overscroll-behavior: contain; padding: 6px 0 96px; }
  .dshdc-center { padding: 40px 16px; text-align: center; color: var(--dsw-alias-label-tertiary); font-size: 12px; }
  .dshdc-list-row { display: flex; align-items: center; gap: 10px; padding: 5px 14px; font-size: 12px; border-bottom: 1px solid var(--dsw-alias-border-l2); }
  .dshdc-list-name { flex: none; min-width: 140px; max-width: 320px; color: var(--dsw-alias-label-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: var(--ds-font-family-code); }
  .dshdc-list-meta { flex: none; color: var(--dsw-alias-label-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 260px; }
  .dshdc-list-id { flex: none; color: var(--dsw-alias-label-tertiary); font-family: var(--ds-font-family-code); }
  .dshdc-list-state { flex: none; color: var(--dsw-alias-label-secondary); min-width: 56px; }
  .dshdc-list-state[data-state="running"] { color: var(--dsw-alias-state-business-primary); }
  .dshdc-job { margin: 8px 14px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; overflow: hidden; }
  .dshdc-job-head { display: flex; align-items: center; gap: 10px; padding: 6px 10px; border-bottom: 1px solid var(--dsw-alias-border-l2); font-size: 12px; }
  .dshdc-job-label { flex: 1; min-width: 0; color: var(--dsw-alias-label-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dshdc-job-status { flex: none; color: var(--dsw-alias-label-secondary); }
  .dshdc-log { margin: 0; padding: 8px 10px; font-family: var(--ds-font-family-code); font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-secondary); white-space: pre-wrap; word-break: break-all; max-height: 240px; overflow: auto; background: var(--dsw-alias-bg-base); }
  .dshdc-cand-list { flex: none; max-height: 220px; overflow-y: auto; overscroll-behavior: contain; border-bottom: 1px solid var(--dsw-alias-border-l2); padding: 2px 6px 6px; }
  .dshdc-cand-list .dshdc-row { cursor: pointer; }

  /* Docker 面板终端（xterm.js） */
  .dshdc-terminal { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
  .dshfm-term { flex: 1; min-width: 0; min-height: 0; padding: 8px 10px; overflow: hidden; background: #0f1115; }
  .dshfm-term .xterm { height: 100%; }
  .dshfm-term .xterm-viewport { background-color: transparent; }

  /* xterm.js 基础样式（node_modules/xterm/css/xterm.css，MIT） */
  .xterm { cursor: text; position: relative; user-select: none; -ms-user-select: none; -webkit-user-select: none; }
  .xterm.focus, .xterm:focus { outline: none; }
  .xterm .xterm-helpers { position: absolute; top: 0; z-index: 5; }
  .xterm .xterm-helper-textarea { padding: 0; border: 0; margin: 0; position: absolute; opacity: 0; left: -9999em; top: 0; width: 0; height: 0; z-index: -5; white-space: nowrap; overflow: hidden; resize: none; }
  .xterm .composition-view { background: #000; color: #FFF; display: none; position: absolute; white-space: nowrap; z-index: 1; }
  .xterm .composition-view.active { display: block; }
  .xterm .xterm-viewport { background-color: #000; overflow-y: scroll; cursor: default; position: absolute; right: 0; left: 0; top: 0; bottom: 0; }
  .xterm .xterm-screen { position: relative; }
  .xterm .xterm-screen canvas { position: absolute; left: 0; top: 0; }
  .xterm .xterm-scroll-area { visibility: hidden; }
  .xterm-char-measure-element { display: inline-block; visibility: hidden; position: absolute; top: 0; left: -9999em; line-height: normal; }
  .xterm.enable-mouse-events { cursor: default; }
  .xterm.xterm-cursor-pointer, .xterm .xterm-cursor-pointer { cursor: pointer; }
  .xterm.column-select.focus { cursor: crosshair; }
  .xterm .xterm-accessibility, .xterm .xterm-message { position: absolute; left: 0; top: 0; bottom: 0; right: 0; z-index: 10; color: transparent; pointer-events: none; }
  .xterm .live-region { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
  .xterm-dim { opacity: 1 !important; }
  .xterm-underline-1 { text-decoration: underline; }
  .xterm-underline-2 { text-decoration: double underline; }
  .xterm-underline-3 { text-decoration: wavy underline; }
  .xterm-underline-4 { text-decoration: dotted underline; }
  .xterm-underline-5 { text-decoration: dashed underline; }
  .xterm-overline { text-decoration: overline; }
  .xterm-overline.xterm-underline-1 { text-decoration: overline underline; }
  .xterm-overline.xterm-underline-2 { text-decoration: overline double underline; }
  .xterm-overline.xterm-underline-3 { text-decoration: overline wavy underline; }
  .xterm-overline.xterm-underline-4 { text-decoration: overline dotted underline; }
  .xterm-overline.xterm-underline-5 { text-decoration: overline dashed underline; }
  .xterm-strikethrough { text-decoration: line-through; }
  .xterm-screen .xterm-decoration-container .xterm-decoration { z-index: 6; position: absolute; }
  .xterm-screen .xterm-decoration-container .xterm-decoration.xterm-decoration-top-layer { z-index: 7; }
  .xterm-decoration-overview-ruler { z-index: 8; position: absolute; top: 0; right: 0; pointer-events: none; }
  .xterm-decoration-top { z-index: 2; position: relative; }
`

const TAG_ID = '@deepseek-ai/dsh-workspace-toolbox/client.css'

/** 幂等地把插件样式注入 document（静态 bundle 的标准做法）。 */
export function ensureCss(): void {
  if (typeof document === 'undefined') return
  if (document.querySelector('style[data-plugin-css=' + JSON.stringify(TAG_ID) + ']') !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = '@deepseek-ai/dsh-workspace-toolbox'
  tag.dataset.pluginCss = TAG_ID
  tag.textContent = CSS
  document.head.appendChild(tag)
}
