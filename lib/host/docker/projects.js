/**
 * 工作区 Dockerfile 项目扫描与已添加项目持久化。
 *
 * - `scanProjects`：浅层自动扫描（深度 ≤3），构建下拉直接使用；
 * - `scanAllDockerfileModules`：深层全量候选扫描（深度 ≤8、上限 100），
 *   供「＋ 添加」按钮识别工作区中所有含 Dockerfile 的模块；
 * - 已添加项目按工作区相对路径持久化到 ~/.dsh/storages 下的 JSON 文件，
 *   重启后保留；目录被删/不再含 Dockerfile 时自动剔除。
 */
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
const IGNORED = new Set([
    'node_modules', '.git', '.svn', '.hg', '.dsh', '__pycache__', '.venv',
    'venv', '.tox', '.cache', '.turbo', '.next', '.nuxt', '.pnpm',
    '.idea', '.vscode', '.DS_Store', 'dist', 'build', 'out', 'coverage',
]);
/** 已添加项目的持久化路径（与 docker 连接元数据同级）。 */
const ADDED_STORE = join(homedir(), '.dsh', 'storages', 'dsh-workspace-toolbox', 'docker-projects.json');
function isDirectory(path) {
    try {
        return statSync(path).isDirectory();
    }
    catch {
        return false;
    }
}
function hasDockerfile(dir) {
    try {
        for (const name of readdirSync(dir)) {
            if (name.toLowerCase() === 'dockerfile')
                return true;
        }
    }
    catch {
        // 不可读目录忽略
    }
    return false;
}
function toProject(rel, dir) {
    const name = rel.split('/').filter(Boolean).pop() ?? rel;
    return { name: rel === '' ? name : rel, rel, dir, dockerfile: join(dir, 'Dockerfile') };
}
/** 浅层自动扫描（构建下拉直接使用）。 */
export function scanProjects(root, maxDepth = 3) {
    const out = [];
    const walk = (dir, rel, depth) => {
        if (depth > maxDepth || out.length >= 50)
            return;
        if (depth > 0 && hasDockerfile(dir)) {
            out.push(toProject(rel, dir));
            return;
        }
        let entries;
        try {
            entries = readdirSync(dir);
        }
        catch {
            return;
        }
        for (const entry of entries) {
            if (IGNORED.has(entry))
                continue;
            const child = join(dir, entry);
            if (!isDirectory(child))
                continue;
            walk(child, rel === '' ? entry : rel + '/' + entry, depth + 1);
        }
    };
    walk(root, '', 0);
    out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
}
/** 深层全量候选扫描：工作区中所有含 Dockerfile 的模块（含嵌套）。 */
export function scanAllDockerfileModules(root, maxDepth = 8, cap = 100) {
    const out = [];
    const walk = (dir, rel, depth) => {
        if (depth > maxDepth || out.length >= cap)
            return;
        if (depth > 0 && hasDockerfile(dir))
            out.push(toProject(rel, dir));
        let entries;
        try {
            entries = readdirSync(dir);
        }
        catch {
            return;
        }
        for (const entry of entries) {
            if (IGNORED.has(entry))
                continue;
            const child = join(dir, entry);
            if (!isDirectory(child))
                continue;
            walk(child, rel === '' ? entry : rel + '/' + entry, depth + 1);
        }
    };
    walk(root, '', 0);
    out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
}
function loadAddedRels() {
    try {
        const parsed = JSON.parse(readFileSync(ADDED_STORE, 'utf8'));
        if (Array.isArray(parsed))
            return parsed.filter((x) => typeof x === 'string');
    }
    catch {
        // 首次运行或文件损坏
    }
    return [];
}
function saveAddedRels(rels) {
    try {
        mkdirSync(join(ADDED_STORE, '..'), { recursive: true });
        writeFileSync(ADDED_STORE, JSON.stringify(rels, null, 2));
    }
    catch {
        // 持久化失败不影响本次会话
    }
}
/** 判断是否为绝对路径（Windows 盘符或 POSIX 根）。 */
function isAbsolutePath(p) {
    return /^[a-zA-Z]:[\\/]/.test(p) || p.startsWith('/');
}
/** 合并列表：浅层自动扫描 ∪ 已添加（目录被删/不再含 Dockerfile 的自动剔除）。 */
export function listWorkspaceProjects(root) {
    const auto = scanProjects(root).map((p) => ({ ...p, added: false }));
    const seenDirs = new Set(auto.map((p) => p.dir));
    const out = [...auto];
    for (const entry of loadAddedRels()) {
        const abs = isAbsolutePath(entry) ? entry : join(root, entry);
        if (!isDirectory(abs) || !hasDockerfile(abs))
            continue;
        if (seenDirs.has(abs))
            continue;
        const name = entry.split(/[\\/]/).filter(Boolean).pop() ?? entry;
        out.push({ name, rel: entry, dir: abs, dockerfile: join(abs, 'Dockerfile'), added: true });
        seenDirs.add(abs);
    }
    out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
}
/**
 * 添加一个项目到持久化列表（支持工作区相对路径或任意绝对路径）；
 * 返回更新后的合并列表。
 */
export function addWorkspaceProject(root, path) {
    const clean = path.trim().replace(/^["']+|["']+$/g, '');
    if (clean === '')
        return { ok: false, error: 'INVALID_DIR' };
    const abs = isAbsolutePath(clean) ? clean : join(root, clean.replace(/^[\\/]+/, ''));
    if (!isDirectory(abs))
        return { ok: false, error: 'NOT_FOUND' };
    if (!hasDockerfile(abs))
        return { ok: false, error: 'NO_DOCKERFILE' };
    const entry = isAbsolutePath(clean) ? clean : clean.replace(/^[\\/]+/, '');
    const rels = loadAddedRels();
    if (!rels.includes(entry)) {
        rels.push(entry);
        saveAddedRels(rels);
    }
    return { ok: true, projects: listWorkspaceProjects(root) };
}
/** 从持久化列表移除一个项目（支持相对/绝对路径）；返回更新后的合并列表。 */
export function removeWorkspaceProject(root, path) {
    const clean = path.trim().replace(/^["']+|["']+$/g, '');
    if (clean === '')
        return { ok: false, error: 'INVALID_PATH' };
    const abs = isAbsolutePath(clean) ? clean : join(root, clean);
    const rels = loadAddedRels();
    const next = rels.filter((e) => {
        if (e === clean)
            return false;
        const eAbs = isAbsolutePath(e) ? e : join(root, e);
        return eAbs !== abs;
    });
    if (next.length === rels.length)
        return { ok: false, error: 'NOT_ADDED' };
    saveAddedRels(next);
    return { ok: true, projects: listWorkspaceProjects(root) };
}
