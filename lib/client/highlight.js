/**
 * 语法高亮：基于 highlight.js（内联 core + 按需注册语言），
 * 输出 HTML token 串，由 styles.ts 中的 hljs-* 主题类着色。
 */
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import css from 'highlight.js/lib/languages/css';
import go from 'highlight.js/lib/languages/go';
import ini from 'highlight.js/lib/languages/ini';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import kotlin from 'highlight.js/lib/languages/kotlin';
import less from 'highlight.js/lib/languages/less';
import markdown from 'highlight.js/lib/languages/markdown';
import plaintext from 'highlight.js/lib/languages/plaintext';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import scss from 'highlight.js/lib/languages/scss';
import sql from 'highlight.js/lib/languages/sql';
import swift from 'highlight.js/lib/languages/swift';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('c', c);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('css', css);
hljs.registerLanguage('go', go);
hljs.registerLanguage('ini', ini);
hljs.registerLanguage('java', java);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('less', less);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('python', python);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('scss', scss);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('swift', swift);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('yaml', yaml);
/** 高亮整段代码并返回 HTML（未注册的语言回退 plaintext）。 */
export function highlightCode(code, lang) {
    const target = hljs.getLanguage(lang) !== undefined ? lang : 'plaintext';
    return hljs.highlight(code, { language: target }).value;
}
/**
 * 扩展名 → highlight.js 语言键。
 * 注意 markdown 在预览中走渲染视图（见 markdown.ts），源码视图仍用本映射。
 */
export function detectLang(name) {
    const dot = name.lastIndexOf('.');
    const ext = dot < 0 ? '' : name.slice(dot + 1).toLowerCase();
    if (['js', 'mjs', 'cjs', 'jsx'].includes(ext))
        return 'javascript';
    if (['ts', 'tsx'].includes(ext))
        return 'typescript';
    if (ext === 'py')
        return 'python';
    if (ext === 'go')
        return 'go';
    if (ext === 'rs')
        return 'rust';
    if (ext === 'c' || ext === 'h')
        return 'c';
    if (['cpp', 'cc', 'cxx', 'hpp', 'hh'].includes(ext))
        return 'cpp';
    if (ext === 'cs')
        return 'csharp';
    if (ext === 'java')
        return 'java';
    if (ext === 'kt' || ext === 'kts')
        return 'kotlin';
    if (ext === 'swift')
        return 'swift';
    if (ext === 'css')
        return 'css';
    if (['scss', 'sass'].includes(ext))
        return 'scss';
    if (ext === 'less')
        return 'less';
    if (['html', 'htm', 'vue', 'svelte'].includes(ext))
        return 'xml';
    if (['json', 'jsonc'].includes(ext))
        return 'json';
    if (['yaml', 'yml', 'toml'].includes(ext))
        return 'yaml';
    if (['sh', 'bash', 'zsh', 'fish'].includes(ext))
        return 'bash';
    if (ext === 'sql')
        return 'sql';
    if (['md', 'markdown', 'mdown'].includes(ext))
        return 'markdown';
    if (['xml', 'plist', 'svg'].includes(ext))
        return 'xml';
    if (['ini', 'cfg', 'conf', 'env', 'properties'].includes(ext))
        return 'ini';
    return 'plaintext';
}
/** 判断文件是否为 Markdown（预览走渲染视图）。 */
export function isMarkdown(name) {
    return detectLang(name) === 'markdown';
}
