/** 噪音目录/文件：版本控制、依赖、构建缓存、编辑器与 OS 产物。 */
export const IGNORED = new Set([
    '.git', '.svn', '.hg', '.dsh', 'node_modules', '__pycache__',
    '.venv', 'venv', '.tox', '.mypy_cache', '.pytest_cache', '.ruff_cache',
    '.cache', '.turbo', '.next', '.nuxt', '.pnpm', '.pnpm-store', '.yarn',
    '.idea', '.vscode', '.DS_Store', 'desktop.ini', 'thumbs.db',
]);
const IMAGE_MIME = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
    webp: 'image/webp', bmp: 'image/bmp', ico: 'image/x-icon', avif: 'image/avif',
};
/** 预览上限：文本 256KB、图片 3MB、搜索访问 6000 项 / 深度 12 / 结果 200。 */
export const MAX_TEXT = 256 * 1024;
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const MAX_SEARCH_MATCHES = 200;
export const MAX_SEARCH_VISIT = 6000;
export const MAX_SEARCH_DEPTH = 12;
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
/** 纯 JS 的字节 → base64（不依赖 Buffer，供宿主受限环境使用）。 */
export function bytesToBase64(bytes) {
    let out = '';
    for (let i = 0; i < bytes.length; i += 3) {
        const b0 = bytes[i] ?? 0;
        const b1 = i + 1 < bytes.length ? bytes[i + 1] ?? 0 : 0;
        const b2 = i + 2 < bytes.length ? bytes[i + 2] ?? 0 : 0;
        out += B64[b0 >> 2];
        out += B64[((b0 & 3) << 4) | (b1 >> 4)];
        out += i + 1 < bytes.length ? B64[((b1 & 15) << 2) | (b2 >> 6)] : '=';
        out += i + 2 < bytes.length ? B64[b2 & 63] : '=';
    }
    return out;
}
/** 目标在宿主执行环境中的绝对路径（供系统打开用）；失败返回 undefined。 */
export function absPath(ctx, target) {
    try {
        return ctx.fs.processPath(target);
    }
    catch {
        return undefined;
    }
}
/** 列出单层目录（目录在前、按名排序，噪音目录剔除）。 */
export async function listLevel(ctx, target, rel) {
    let entries;
    try {
        entries = await ctx.fs.listDir(target);
    }
    catch {
        return [];
    }
    const out = [];
    for (const entry of entries) {
        if (IGNORED.has(entry.name))
            continue;
        const childRel = rel === '' ? entry.name : rel + '/' + entry.name;
        const isDir = entry.type === 'directory';
        const node = {
            name: entry.name,
            path: childRel,
            type: isDir ? 'dir' : (entry.type === 'file' ? 'file' : 'other'),
        };
        if (!isDir) {
            if (typeof entry.size === 'number')
                node.size = entry.size;
            const abs = absPath(ctx, entry.target);
            if (typeof abs === 'string')
                node.abs = abs;
        }
        out.push(node);
    }
    out.sort((a, b) => {
        if ((a.type === 'dir') !== (b.type === 'dir'))
            return a.type === 'dir' ? -1 : 1;
        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    });
    return out;
}
/** 有界深度优先遍历，按名称（大小写不敏感）收集匹配项。 */
export async function searchWorkspace(ctx, root, query) {
    const matches = [];
    let visited = 0;
    let truncated = false;
    const walk = async (target, rel, depth) => {
        if (depth > MAX_SEARCH_DEPTH || truncated)
            return;
        let entries;
        try {
            entries = await ctx.fs.listDir(target);
        }
        catch {
            return;
        }
        for (const entry of entries) {
            if (truncated)
                return;
            visited += 1;
            if (visited > MAX_SEARCH_VISIT) {
                truncated = true;
                return;
            }
            if (IGNORED.has(entry.name))
                continue;
            const childRel = rel === '' ? entry.name : rel + '/' + entry.name;
            if (entry.name.toLowerCase().indexOf(query) >= 0) {
                const isDir = entry.type === 'directory';
                const match = {
                    name: entry.name,
                    path: childRel,
                    type: isDir ? 'dir' : (entry.type === 'file' ? 'file' : 'other'),
                };
                if (!isDir) {
                    if (typeof entry.size === 'number')
                        match.size = entry.size;
                    const abs = absPath(ctx, entry.target);
                    if (typeof abs === 'string')
                        match.abs = abs;
                }
                matches.push(match);
                if (matches.length >= MAX_SEARCH_MATCHES) {
                    truncated = true;
                    return;
                }
            }
            if (entry.type === 'directory')
                await walk(entry.target, childRel, depth + 1);
        }
    };
    await walk(root, '', 0);
    return { matches, truncated };
}
function extensionOf(rel) {
    const dot = rel.lastIndexOf('.');
    const slash = rel.lastIndexOf('/');
    return dot > slash ? rel.slice(dot + 1).toLowerCase() : '';
}
/**
 * 只读预览：图片（含 SVG）转 data URL；文本流式读取到上限截断；
 * 其余按二进制元数据返回。
 */
export async function readPreview(ctx, target, rel, size) {
    const ext = extensionOf(rel);
    if (ext === 'svg') {
        try {
            const text = await ctx.fs.readText(target);
            return { kind: 'image', dataUrl: 'data:image/svg+xml;base64,' + btoa(text), size };
        }
        catch {
            return { kind: 'binary', size };
        }
    }
    if (IMAGE_MIME[ext] !== undefined) {
        try {
            const bytes = await ctx.fs.readBytes(target, undefined, MAX_IMAGE_BYTES);
            return { kind: 'image', dataUrl: 'data:' + IMAGE_MIME[ext] + ';base64,' + bytesToBase64(bytes), size };
        }
        catch {
            return { kind: 'binary', size };
        }
    }
    try {
        let text = '';
        let truncated = false;
        const stream = await ctx.fs.streamText(target);
        for await (const chunk of stream) {
            if (text.length + chunk.length > MAX_TEXT) {
                text += chunk.slice(0, MAX_TEXT - text.length);
                truncated = true;
                break;
            }
            text += chunk;
        }
        return { kind: 'text', text, size, truncated };
    }
    catch {
        return { kind: 'binary', size };
    }
}
