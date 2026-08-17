import { resolveRoot } from '../workspace.js';
import { listRuns, startRun, stopRun } from './manager.js';
import { scanViteProjects } from './projects.js';
const PREFIX = '/dsh-workspace-toolbox/vite';
function json(res, status, body) {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
}
async function readJsonBody(req) {
    const chunks = [];
    for await (const chunk of req)
        chunks.push(chunk);
    if (chunks.length === 0)
        return {};
    const text = Buffer.concat(chunks).toString('utf8');
    try {
        return JSON.parse(text);
    }
    catch {
        return {};
    }
}
function str(value, fallback = '') {
    return typeof value === 'string' ? value : fallback;
}
function messageOf(error) {
    return error instanceof Error ? error.message : String(error);
}
export function registerViteRoutes(ctx) {
    // GET /vite/projects?session=<id> → 工作区 Vite 项目
    ctx.effect(() => ctx.webServer.register({
        kind: 'exact',
        path: PREFIX + '/projects',
        handler: async (req, res) => {
            try {
                const u = new URL(req.url ?? '/', 'http://localhost');
                const resolved = await resolveRoot(ctx, u.searchParams.get('session') ?? '');
                if ('error' in resolved)
                    return json(res, 200, { ok: false, error: resolved.error });
                json(res, 200, { ok: true, projects: scanViteProjects(resolved.rootPath) });
            }
            catch (error) {
                json(res, 200, { ok: false, error: 'SCAN_FAILED', message: messageOf(error) });
            }
        },
    }));
    // GET /vite/status → 所有 dev server 状态（含日志）
    ctx.effect(() => ctx.webServer.register({
        kind: 'exact',
        path: PREFIX + '/status',
        handler: async (_req, res) => {
            json(res, 200, { ok: true, runs: listRuns() });
        },
    }));
    // POST /vite/start { session, dir, command? } → { run }
    ctx.effect(() => ctx.webServer.register({
        kind: 'exact',
        path: PREFIX + '/start',
        handler: async (req, res) => {
            try {
                const body = await readJsonBody(req);
                const resolved = await resolveRoot(ctx, str(body.session));
                if ('error' in resolved)
                    return json(res, 200, { ok: false, error: resolved.error });
                const rel = str(body.dir).trim();
                if (rel === '')
                    return json(res, 200, { ok: false, error: 'INVALID_DIR' });
                // 项目目录必须位于工作区之内（dir 是相对路径）。
                const target = await ctx.fs.resolve(rel, { cwd: resolved.rootPath });
                if (!ctx.fs.contains(resolved.root, target))
                    return json(res, 200, { ok: false, error: 'OUT_OF_BOUNDS' });
                const absDir = ctx.fs.processPath(target);
                const name = rel.split('/').filter(Boolean).pop() ?? rel;
                const result = startRun(rel, name, absDir, str(body.command));
                if (!result.ok)
                    return json(res, 200, { ok: false, error: result.error });
                json(res, 200, { ok: true, run: result.run });
            }
            catch (error) {
                json(res, 200, { ok: false, error: 'START_FAILED', message: messageOf(error) });
            }
        },
    }));
    // POST /vite/stop { key } → 停止
    ctx.effect(() => ctx.webServer.register({
        kind: 'exact',
        path: PREFIX + '/stop',
        handler: async (req, res) => {
            const body = await readJsonBody(req);
            const key = str(body.key).trim();
            if (key === '')
                return json(res, 200, { ok: false, error: 'INVALID_KEY' });
            const result = stopRun(key);
            json(res, 200, result.ok ? { ok: true } : { ok: false, error: result.error });
        },
    }));
}
