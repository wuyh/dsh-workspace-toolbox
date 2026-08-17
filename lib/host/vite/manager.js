/**
 * Vite dev server 进程管理：启动 / 停止 / 状态 / 日志。
 *
 * - 每个项目一个 dev server，按工作区相对路径（key）索引；
 * - 日志有界缓冲（MAX_LOG），URL/端口从 vite 的 "Local:" 行解析；
 * - 停止时整进程树结束（Windows taskkill /T，POSIX 进程组）；
 * - 插件卸载（disposeAllRuns）时结束所有仍在运行的 dev server。
 */
import { spawn } from 'node:child_process';
const MAX_LOG = 200 * 1024;
const runs = new Map();
/** 供浏览器端序列化的视图（剥离 ChildProcess）。 */
function toView(run) {
    const { proc: _proc, ...view } = run;
    return { ...view, pid: run.proc.pid ?? null };
}
function commandLine() {
    if (process.platform === 'win32') {
        return { shell: process.env.ComSpec ?? 'C:\\Windows\\System32\\cmd.exe', args: ['/d', '/s', '/c'] };
    }
    return { shell: '/bin/sh', args: ['-c'] };
}
function appendLog(run, text) {
    run.log = (run.log + text).slice(-MAX_LOG);
}
const URL_RE = /https?:\/\/(localhost|127\.0\.0\.1|\[::1\]):(\d+)/;
function feed(run, chunk) {
    appendLog(run, chunk.toString('utf8'));
    if (run.status === 'starting' || run.status === 'running') {
        const m = URL_RE.exec(run.log);
        if (m !== null && run.status !== 'running') {
            run.port = Number.parseInt(m[2] ?? '0', 10);
            run.url = `http://localhost:${m[2]}`;
            run.status = 'running';
        }
    }
}
export function listRuns() {
    return [...runs.values()].map((run) => toView(run));
}
/**
 * 启动一个项目的 dev server（默认命令 pnpm run dev，可覆盖）。
 * 已在启动/运行中时直接返回现有 run。
 */
export function startRun(key, name, dir, command) {
    const existing = runs.get(key);
    if (existing !== undefined && (existing.status === 'starting' || existing.status === 'running')) {
        return { ok: true, run: toView(existing) };
    }
    const cmdLine = (command ?? 'pnpm run dev').trim();
    if (cmdLine === '')
        return { ok: false, error: 'EMPTY_COMMAND' };
    const { shell, args } = commandLine();
    let child;
    try {
        child = spawn(shell, [...args, cmdLine], {
            cwd: dir,
            stdio: ['ignore', 'pipe', 'pipe'],
            detached: process.platform !== 'win32',
            env: {
                ...process.env,
                NO_COLOR: '1',
                FORCE_COLOR: '0',
                TERM: 'dumb',
            },
        });
    }
    catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
    const run = {
        key, name, dir,
        status: 'starting',
        pid: child.pid ?? null,
        log: `$ ${cmdLine}\n`,
        startedAt: Date.now(),
        proc: child,
    };
    runs.set(key, run);
    child.stdout?.on('data', (d) => feed(run, d));
    child.stderr?.on('data', (d) => feed(run, d));
    child.on('error', (error) => {
        appendLog(run, `[spawn error] ${error.message}\n`);
        run.status = 'error';
    });
    child.on('exit', (code, signal) => {
        appendLog(run, `[exit] code=${code ?? 'null'} signal=${signal ?? 'none'}\n`);
        if (run.status === 'starting' || run.status === 'running')
            run.status = 'stopped';
        run.stoppedAt = Date.now();
        run.pid = null;
    });
    return { ok: true, run: toView(run) };
}
/** 停止一个 dev server（整进程树）。 */
export function stopRun(key) {
    const run = runs.get(key);
    if (run === undefined)
        return { ok: false, error: 'NOT_RUNNING' };
    if (run.status !== 'starting' && run.status !== 'running') {
        appendLog(run, '[stop] 已处于停止状态\n');
        return { ok: true };
    }
    const pid = run.proc.pid;
    if (pid === undefined || pid === null) {
        appendLog(run, '[stop] 无可用 pid\n');
        run.status = 'stopped';
        run.stoppedAt = Date.now();
        return { ok: true };
    }
    appendLog(run, '[stop] 结束进程树\n');
    if (process.platform === 'win32') {
        try {
            const killer = spawn('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
            killer.on('error', () => { });
        }
        catch {
            // 进程可能已退出
        }
    }
    else {
        try {
            process.kill(-pid, 'SIGTERM');
        }
        catch {
            // 已退出
        }
        const timer = setTimeout(() => {
            try {
                process.kill(-pid, 'SIGKILL');
            }
            catch {
                // 已退出
            }
        }, 3000);
        timer.unref?.();
    }
    return { ok: true };
}
/** 结束所有仍在运行的 dev server（插件卸载时调用）。 */
export function disposeAllRuns() {
    for (const run of [...runs.values()]) {
        if (run.status === 'starting' || run.status === 'running')
            stopRun(run.key);
    }
    runs.clear();
}
