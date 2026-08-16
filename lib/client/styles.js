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
  .dshfm-preview-head { flex: none; display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-bottom: 1px solid var(--dsw-alias-border-l2); }
  .dshfm-preview-name { font-size: 13px; font-weight: 500; color: var(--dsw-alias-label-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dshfm-preview-meta { flex: none; font-size: 11px; color: var(--dsw-alias-label-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dshfm-preview-spacer { flex: 1; }
  .dshfm-preview-body { flex: 1; min-height: 0; overflow: auto; overscroll-behavior: contain; padding-bottom: 96px; background: var(--dsw-alias-bg-base); }
  .dshfm-code { display: flex; min-width: 100%; width: max-content; font-family: var(--ds-font-family-code); font-size: 12px; }
  .dshfm-gutter { flex: none; padding: 10px 0; text-align: right; color: var(--dsw-alias-label-dimmed); user-select: none; border-right: 1px solid var(--dsw-alias-border-l2); }
  .dshfm-ln { line-height: 18px; padding: 0 10px 0 14px; }
  .dshfm-code-text { padding: 10px 16px; }
  .dshfm-line { line-height: 18px; white-space: pre; }
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
`;
const TAG_ID = '@deepseek-ai/dsh-workspace-files/client.css';
/** 幂等地把插件样式注入 document（静态 bundle 的标准做法）。 */
export function ensureCss() {
    if (typeof document === 'undefined')
        return;
    if (document.querySelector('style[data-plugin-css=' + JSON.stringify(TAG_ID) + ']') !== null)
        return;
    const tag = document.createElement('style');
    tag.dataset.plugin = '@deepseek-ai/dsh-workspace-files';
    tag.dataset.pluginCss = TAG_ID;
    tag.textContent = CSS;
    document.head.appendChild(tag);
}
