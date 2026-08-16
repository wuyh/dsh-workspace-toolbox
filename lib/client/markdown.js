/**
 * Markdown 渲染：marked（GFM）解析 + DOMPurify 消毒（防 XSS）。
 * 工作区文件视为半可信内容：渲染前必须过消毒层，禁止原始 HTML 直出。
 */
import DOMPurify from 'dompurify';
import { marked } from 'marked';
export function renderMarkdown(source) {
    const raw = marked.parse(source, { async: false, gfm: true, breaks: false });
    return DOMPurify.sanitize(raw, {
        USE_PROFILES: { html: true },
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'align', 'class'],
    });
}
