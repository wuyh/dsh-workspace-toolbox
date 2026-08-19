/**
 * Docker 服务视图：本地/远程（SSH 隧道）Docker 连接管理、工作区
 * Dockerfile 项目联动（构建/运行）、镜像与容器管理、长任务日志。
 */
import * as React from 'react';
import { dockerRpc, } from './docker-rpc.js';
import { TerminalView } from './docker-terminal.js';
function fmtSize(n) {
    if (typeof n !== 'number')
        return '';
    if (n < 1024)
        return n + ' B';
    if (n < 1048576)
        return (n / 1024).toFixed(1) + ' KB';
    if (n < 1048576 * 1024)
        return (n / 1048576).toFixed(1) + ' MB';
    return (n / 1048576 / 1024).toFixed(2) + ' GB';
}
function repoTagOf(image) {
    const tags = image.RepoTags ?? [];
    if (tags.length > 0)
        return tags[0] ?? '';
    return (image.Id ?? '').replace('sha256:', '').slice(0, 12);
}
function nameOf(container) {
    return (container.Names[0] ?? container.Id).replace(/^\//, '');
}
function portsOf(container) {
    const parts = container.Ports.map((p) => (p.PublicPort !== undefined ? `${p.PublicPort}->${p.PrivatePort}` : String(p.PrivatePort)));
    return parts.join(', ');
}
const sessionStores = new Map();
function sessionStore(sid) {
    let store = sessionStores.get(sid);
    if (store === undefined) {
        store = { tab: 'images', conn: 'local' };
        sessionStores.set(sid, store);
    }
    return store;
}
export function DockerPanel(props) {
    const sid = typeof props.sessionId === 'string' ? props.sessionId : '';
    const store = sessionStore(sid);
    const [connections, setConnections] = React.useState(null);
    const [conn, setConn] = React.useState(store.conn);
    const [tab, setTab] = React.useState(store.tab);
    const [images, setImages] = React.useState({ phase: 'idle', rows: [], error: '' });
    const [containers, setContainers] = React.useState({ phase: 'idle', rows: [], error: '' });
    const [jobs, setJobs] = React.useState([]);
    const [projects, setProjects] = React.useState(null);
    const [addOpen, setAddOpen] = React.useState(false);
    const [form, setForm] = React.useState({ name: '', host: '', port: '22', username: '', authKind: 'password', password: '', keyPath: '~/.ssh/id_ed25519', passphrase: '' });
    const [connectError, setConnectError] = React.useState('');
    const [connecting, setConnecting] = React.useState(false);
    const [rowError, setRowError] = React.useState('');
    const [reconnectingId, setReconnectingId] = React.useState('');
    /** 终端进入的容器 id（'' 表示连接自身的 shell）。 */
    const [termContainer, setTermContainer] = React.useState('');
    /** 项目候选面板（「＋ 添加」）。 */
    const [showCandidates, setShowCandidates] = React.useState(false);
    const [candidates, setCandidates] = React.useState(null);
    const [addingRel, setAddingRel] = React.useState('');
    /** 按绝对路径添加的输入框。 */
    const [addPath, setAddPath] = React.useState('');
    const [buildDir, setBuildDir] = React.useState('');
    const [buildTag, setBuildTag] = React.useState('');
    const [pullImage, setPullImage] = React.useState('');
    const [runImage, setRunImage] = React.useState('');
    const [runName, setRunName] = React.useState('');
    const [runPorts, setRunPorts] = React.useState('');
    const [runEnv, setRunEnv] = React.useState('');
    const [logs, setLogs] = React.useState(null);
    React.useEffect(() => { store.conn = conn; }, [conn]);
    React.useEffect(() => { store.tab = tab; }, [tab]);
    const refreshConnections = () => {
        dockerRpc.connections().then((res) => { if (res.ok)
            setConnections(res.connections); }).catch(() => { });
    };
    const refreshImages = () => {
        setImages((s) => ({ ...s, phase: 'loading' }));
        dockerRpc.images(conn).then((res) => {
            if (res.ok)
                setImages({ phase: 'ready', rows: res.images, error: '' });
            else
                setImages({ phase: 'error', rows: [], error: res.error });
        }).catch(() => setImages({ phase: 'error', rows: [], error: 'UNKNOWN' }));
    };
    const refreshContainers = () => {
        setContainers((s) => ({ ...s, phase: 'loading' }));
        dockerRpc.containers(conn).then((res) => {
            if (res.ok)
                setContainers({ phase: 'ready', rows: res.containers, error: '' });
            else
                setContainers({ phase: 'error', rows: [], error: res.error });
        }).catch(() => setContainers({ phase: 'error', rows: [], error: 'UNKNOWN' }));
    };
    const refreshJobs = () => {
        dockerRpc.jobs().then((res) => { if (res.ok)
            setJobs(res.jobs); }).catch(() => { });
    };
    React.useEffect(() => {
        refreshConnections();
        dockerRpc.projects(sid).then((res) => { if (res.ok)
            setProjects(res.projects); }).catch(() => { });
        refreshJobs();
    }, [sid]);
    // 连接切换 / 页签打开时拉取对应列表（未连接的连接不触发加载）。
    React.useEffect(() => {
        const selected = (connections ?? []).find((c) => c.id === conn);
        if (selected !== undefined && !selected.connected)
            return;
        refreshImages();
        refreshContainers();
    }, [conn, connections]);
    React.useEffect(() => {
        if (tab === 'images')
            refreshImages();
        if (tab === 'containers')
            refreshContainers();
    }, [tab]);
    // 任务轮询（每秒）。
    React.useEffect(() => {
        const timer = window.setInterval(refreshJobs, 1000);
        return () => window.clearInterval(timer);
    }, []);
    const doConnect = () => {
        setConnecting(true);
        setConnectError('');
        dockerRpc.connect({
            id: form.name === '' ? 'ssh-' + Math.random().toString(36).slice(2, 10) : 'ssh-' + Math.random().toString(36).slice(2, 10),
            kind: 'ssh',
            name: form.name.trim() === '' ? form.host.trim() : form.name.trim(),
            host: form.host.trim(),
            port: Number.parseInt(form.port, 10) || 22,
            username: form.username.trim(),
            authKind: form.authKind,
            password: form.authKind === 'password' ? form.password : undefined,
            keyPath: form.authKind === 'key' ? form.keyPath : undefined,
            passphrase: form.authKind === 'key' && form.passphrase !== '' ? form.passphrase : undefined,
        }).then((res) => {
            setConnecting(false);
            if (res.ok) {
                setAddOpen(false);
                setForm({ name: '', host: '', port: '22', username: '', authKind: 'password', password: '', keyPath: '~/.ssh/id_ed25519', passphrase: '' });
                setConn(res.connection.id);
                refreshConnections();
            }
            else {
                setConnectError(res.error);
            }
        }).catch(() => {
            setConnecting(false);
            setConnectError('连接失败（网络或凭据错误）');
        });
    };
    const doDisconnect = (id, forget) => {
        dockerRpc.disconnect(id, forget).then(() => {
            refreshConnections();
            if (id === conn)
                setConn('local');
        }).catch(() => { });
    };
    /**
     * 重新连接一个已保存但未连接的 SSH 连接：用持久化的元数据重建 spec
     * （私钥认证可直接重连；密码认证需重新走「＋ 远程」表单输入密码）。
     */
    const doReconnect = (c) => {
        setRowError('');
        setReconnectingId(c.id);
        dockerRpc.connect({
            id: c.id,
            kind: 'ssh',
            name: c.name,
            host: c.host,
            port: c.port,
            username: c.username,
            authKind: c.authKind,
            keyPath: c.authKind === 'key' ? c.keyPath : undefined,
        }).then((res) => {
            setReconnectingId('');
            if (res.ok) {
                setConn(c.id);
                refreshConnections();
            }
            else {
                const detail = res.message;
                setRowError(res.error + (detail !== undefined && detail !== '' ? '：' + detail : ''));
            }
        }).catch(() => {
            setReconnectingId('');
            setRowError('连接失败（网络或凭据错误）');
        });
    };
    const currentConn = (connections ?? []).find((c) => c.id === conn) ?? null;
    const doBuild = () => {
        if (buildDir === '' || buildTag.trim() === '')
            return;
        dockerRpc.build(sid, conn, buildDir, buildTag.trim()).then((res) => { if (res.ok) {
            setTab('jobs');
            refreshJobs();
        } }).catch(() => { });
    };
    const doPull = () => {
        if (pullImage.trim() === '')
            return;
        dockerRpc.pull(conn, pullImage.trim()).then((res) => { if (res.ok) {
            setTab('jobs');
            refreshJobs();
        } }).catch(() => { });
    };
    const doRun = () => {
        if (runImage.trim() === '')
            return;
        const ports = runPorts.split(/[,，\s]+/).filter((p) => p !== '');
        const env = runEnv.split(/[,，\n]+/).filter((e) => e.trim() !== '');
        dockerRpc.run(conn, runImage.trim(), runName.trim(), ports, env).then((res) => { if (res.ok) {
            setTab('jobs');
            refreshJobs();
        } }).catch(() => { });
    };
    const doStop = (id) => { dockerRpc.stop(conn, id).then(() => refreshJobs()).catch(() => { }); };
    const doRemove = (id) => { dockerRpc.remove(conn, id).then(() => { refreshJobs(); refreshContainers(); }).catch(() => { }); };
    const doRemoveImage = (id) => { dockerRpc.removeImage(conn, id).then(() => { refreshJobs(); refreshImages(); }).catch(() => { }); };
    const doLogs = (id) => {
        setLogs({ containerId: id, text: '', phase: 'loading' });
        dockerRpc.logs(conn, id).then((res) => {
            if (res.ok)
                setLogs({ containerId: id, text: res.logs, phase: 'ready' });
            else
                setLogs({ containerId: id, text: res.error, phase: 'error' });
        }).catch(() => setLogs({ containerId: id, text: '读取日志失败', phase: 'error' }));
    };
    const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));
    // ---- 左侧：连接 + 项目 ----
    const connectionRows = (connections ?? []).map((c) => {
        const dot = c.connected ? '●' : '○';
        const dotCls = c.connected ? 'dshdc-dot dshdc-dot-on' : 'dshdc-dot';
        const engine = c.engine !== undefined && c.engine.version !== undefined ? ` · Docker ${c.engine.version}` : '';
        return React.createElement('div', { key: c.id, className: c.id === conn ? 'dshdc-row dshdc-row-active' : 'dshdc-row', onClick: () => { setRowError(''); setConn(c.id); } }, React.createElement('span', { className: dotCls }, dot), React.createElement('div', { className: 'dshdc-row-main' }, React.createElement('div', { className: 'dshdc-row-name' }, c.name), React.createElement('div', { className: 'dshdc-row-sub' }, c.kind === 'local' ? '本机 unix socket' : `${c.username}@${c.host}:${c.port ?? 22}` + engine)), c.kind === 'ssh' ? React.createElement('div', { className: 'dshdc-row-actions' }, c.connected
            ? React.createElement('button', { type: 'button', className: 'dshdc-mini', onClick: (e) => { e.stopPropagation(); doDisconnect(c.id, false); } }, '断开')
            : React.createElement('button', {
                type: 'button',
                className: 'dshdc-mini',
                disabled: reconnectingId === c.id,
                onClick: (e) => { e.stopPropagation(); doReconnect(c); },
            }, reconnectingId === c.id ? '连接中…' : '连接'), React.createElement('button', { type: 'button', className: 'dshdc-mini', onClick: (e) => { e.stopPropagation(); doDisconnect(c.id, true); } }, '删除')) : null);
    });
    const projectRows = (projects ?? []).map((p) => React.createElement('div', {
        key: p.dir,
        className: buildDir === p.dir ? 'dshdc-row dshdc-row-active' : 'dshdc-row',
        onClick: () => { setBuildDir(p.dir); setBuildTag((prev) => prev === '' ? p.name + ':latest' : prev); },
        title: p.dockerfile,
    }, React.createElement('div', { className: 'dshdc-row-main' }, React.createElement('div', { className: 'dshdc-row-name' }, p.name), React.createElement('div', { className: 'dshdc-row-sub' }, p.dir)), p.added === true
        ? React.createElement('button', { type: 'button', className: 'dshdc-mini', onClick: (e) => { e.stopPropagation(); doRemoveProject(p.rel); } }, '移除')
        : null));
    const refreshCandidates = () => {
        setCandidates(null);
        dockerRpc.projectsCandidates(sid).then((res) => {
            setCandidates(res.ok ? res.projects : []);
        }).catch(() => setCandidates([]));
    };
    const doAddProject = (c) => {
        setAddingRel(c.rel);
        dockerRpc.projectAdd(sid, c.rel).then((res) => {
            setAddingRel('');
            if (res.ok) {
                setProjects(res.projects);
                setCandidates((prev) => (prev ?? []).map((x) => x.rel === c.rel ? { ...x } : x));
            }
            else {
                setRowError('添加失败：' + res.error);
            }
        }).catch(() => { setAddingRel(''); setRowError('添加失败（网络或命令错误）'); });
    };
    /** 按绝对路径添加任意目录下的 Dockerfile 项目。 */
    const doAddPath = () => {
        const path = addPath.trim();
        if (path === '')
            return;
        setAddingRel(path);
        dockerRpc.projectAdd(sid, path).then((res) => {
            setAddingRel('');
            if (res.ok) {
                setProjects(res.projects);
                setAddPath('');
            }
            else {
                setRowError('添加失败：' + res.error);
            }
        }).catch(() => { setAddingRel(''); setRowError('添加失败（网络或命令错误）'); });
    };
    const doRemoveProject = (path) => {
        dockerRpc.projectRemove(sid, path).then((res) => {
            if (res.ok)
                setProjects(res.projects);
            else
                setRowError('移除失败：' + res.error);
        }).catch(() => setRowError('移除失败（网络或命令错误）'));
    };
    const addedDirs = new Set((projects ?? []).map((p) => p.dir));
    const candidateRows = (candidates ?? []).map((c) => {
        const added = addedDirs.has(c.dir);
        return React.createElement('div', {
            key: c.rel,
            className: 'dshdc-row',
            onClick: () => { if (!added && addingRel !== c.rel)
                doAddProject(c); },
            title: c.dir,
        }, React.createElement('div', { className: 'dshdc-row-main' }, React.createElement('div', { className: 'dshdc-row-name' }, c.name), React.createElement('div', { className: 'dshdc-row-sub' }, c.rel)), React.createElement('span', { className: 'dshdc-list-state' }, added ? '已添加'
            : addingRel === c.rel ? '添加中…'
                : React.createElement('button', { type: 'button', className: 'dshdc-mini', onClick: (e) => { e.stopPropagation(); doAddProject(c); } }, '添加')));
    });
    const input = (value, placeholder, onChange, width = 140) => React.createElement('input', {
        className: 'dshdc-input', value, placeholder,
        style: { width },
        onChange: (e) => onChange(e.target.value),
    });
    // ---- 主区 ----
    let content;
    if (currentConn !== null && !currentConn.connected) {
        // 选中了未连接的连接（如重启后）：提示并给出重新连接入口。
        const cc = currentConn;
        content = React.createElement('div', { className: 'dshdc-center' }, React.createElement('div', null, '连接未建立（重启 web profile 后需重新连接）'), React.createElement('button', {
            type: 'button',
            className: 'dshdc-btn',
            style: { marginTop: 12 },
            disabled: reconnectingId === cc.id,
            onClick: () => doReconnect(cc),
        }, reconnectingId === cc.id ? '连接中…' : '重新连接'));
    }
    else if (tab === 'images') {
        if (images.phase === 'loading')
            content = React.createElement('div', { className: 'dshdc-center' }, '加载中…');
        else if (images.phase === 'error')
            content = React.createElement('div', { className: 'dshdc-center' }, '加载失败：' + images.error);
        else if (images.rows.length === 0)
            content = React.createElement('div', { className: 'dshdc-center' }, '暂无镜像（可先在“拉取”或“构建”中获取）');
        else
            content = images.rows.map((img) => React.createElement('div', { key: img.Id, className: 'dshdc-list-row' }, React.createElement('span', { className: 'dshdc-list-name' }, repoTagOf(img)), React.createElement('span', { className: 'dshdc-list-meta' }, fmtSize(img.Size)), React.createElement('span', { className: 'dshdc-list-id' }, (img.Id ?? '').replace('sha256:', '').slice(0, 12)), React.createElement('button', { type: 'button', className: 'dshdc-mini', onClick: () => doRemoveImage(img.Id) }, '删除')));
    }
    else if (tab === 'containers') {
        if (containers.phase === 'loading')
            content = React.createElement('div', { className: 'dshdc-center' }, '加载中…');
        else if (containers.phase === 'error')
            content = React.createElement('div', { className: 'dshdc-center' }, '加载失败：' + containers.error);
        else if (containers.rows.length === 0)
            content = React.createElement('div', { className: 'dshdc-center' }, '暂无容器');
        else
            content = containers.rows.map((c) => React.createElement('div', { key: c.Id }, React.createElement('div', { className: 'dshdc-list-row' }, React.createElement('span', { className: 'dshdc-list-name' }, nameOf(c)), React.createElement('span', { className: 'dshdc-list-meta' }, c.Image), React.createElement('span', { className: 'dshdc-list-state', 'data-state': c.State }, c.State === 'running' ? '运行中' : c.Status), React.createElement('span', { className: 'dshdc-list-meta' }, portsOf(c)), React.createElement('button', { type: 'button', className: 'dshdc-mini', onClick: () => doLogs(c.Id) }, '日志'), c.State === 'running'
                ? React.createElement('button', { type: 'button', className: 'dshdc-mini', onClick: () => { setTermContainer(c.Id); setTab('terminal'); } }, '终端')
                : null, c.State === 'running' ? React.createElement('button', { type: 'button', className: 'dshdc-mini', onClick: () => doStop(c.Id) }, '停止') : null, React.createElement('button', { type: 'button', className: 'dshdc-mini', onClick: () => doRemove(c.Id) }, '删除')), logs !== null && logs.containerId === c.Id
                ? React.createElement('pre', { className: 'dshdc-log' }, logs.phase === 'loading' ? '加载中…' : logs.text)
                : null));
    }
    else if (tab === 'terminal') {
        // 终端：SSH 连接进入服务器，本地连接打开本地 shell，或进入指定容器。
        content = React.createElement(TerminalView, {
            connectionId: conn,
            name: (currentConn !== null ? currentConn.name : '终端') + (termContainer !== '' ? ' · ' + termContainer.slice(0, 12) : ''),
            container: termContainer !== '' ? termContainer : undefined,
        });
    }
    else {
        if (jobs.length === 0)
            content = React.createElement('div', { className: 'dshdc-center' }, '暂无任务');
        else
            content = jobs.map((job) => React.createElement('div', { key: job.id, className: 'dshdc-job', 'data-status': job.status }, React.createElement('div', { className: 'dshdc-job-head' }, React.createElement('span', { className: 'dshdc-job-label' }, job.label), React.createElement('span', { className: 'dshdc-job-status' }, job.status === 'running' ? '⏳ 进行中' : job.status === 'ok' ? '✅ 完成' : '❌ 失败'), job.detail !== undefined ? React.createElement('span', { className: 'dshdc-list-id' }, job.detail.slice(0, 12)) : null), React.createElement('pre', { className: 'dshdc-log' }, job.log === '' ? '（无输出）' : job.log)));
    }
    return React.createElement('div', { className: 'dshdc-main' }, React.createElement('div', { className: 'dshdc-side' }, React.createElement('div', { className: 'dshdc-side-head' }, React.createElement('span', null, '连接'), React.createElement('button', { type: 'button', className: 'dshdc-mini', onClick: () => setAddOpen((v) => !v) }, addOpen ? '收起' : '＋ 远程')), addOpen ? React.createElement('div', { className: 'dshdc-form' }, input(form.name, '名称（可选）', (v) => setField('name', v), '100%'), input(form.host, '服务器地址', (v) => setField('host', v), '100%'), input(form.port, 'SSH 端口', (v) => setField('port', v), '100%'), input(form.username, '用户名', (v) => setField('username', v), '100%'), React.createElement('select', {
        className: 'dshdc-input', style: { width: '100%' }, value: form.authKind,
        onChange: (e) => setField('authKind', e.target.value),
    }, React.createElement('option', { value: 'password' }, '密码认证'), React.createElement('option', { value: 'key' }, '私钥认证')), form.authKind === 'password'
        ? input(form.password, '密码（仅内存，不落盘）', (v) => setField('password', v), '100%')
        : null, form.authKind === 'key'
        ? input(form.keyPath, '私钥路径', (v) => setField('keyPath', v), '100%')
        : null, form.authKind === 'key'
        ? input(form.passphrase, '私钥口令（可空）', (v) => setField('passphrase', v), '100%')
        : null, connectError !== '' ? React.createElement('div', { className: 'dshdc-error' }, connectError) : null, React.createElement('button', { type: 'button', className: 'dshdc-btn', disabled: connecting, onClick: doConnect }, connecting ? '连接中…' : '连接')) : null, React.createElement('div', { className: 'dshdc-side-list' }, connectionRows), rowError !== '' ? React.createElement('div', { className: 'dshdc-error', style: { padding: '4px 10px 8px' } }, rowError) : null, React.createElement('div', { className: 'dshdc-side-head' }, React.createElement('span', null, '工作区项目（含 Dockerfile）'), React.createElement('button', {
        type: 'button',
        className: 'dshdc-mini',
        onClick: () => { if (!showCandidates)
            refreshCandidates(); setShowCandidates((v) => !v); },
    }, showCandidates ? '收起' : '＋ 添加')), showCandidates ? React.createElement('div', { className: 'dshdc-cand-list' }, React.createElement('div', { className: 'dshdc-form' }, React.createElement('input', {
        className: 'dshdc-input',
        style: { width: '100%' },
        value: addPath,
        placeholder: '输入绝对路径，如 D:\\repo\\proj',
        onChange: (e) => setAddPath(e.target.value),
        onKeyDown: (e) => { if (e.key === 'Enter')
            doAddPath(); },
    }), React.createElement('button', {
        type: 'button',
        className: 'dshdc-btn',
        disabled: addPath.trim() === '' || addingRel !== '',
        onClick: doAddPath,
    }, addingRel !== '' && addingRel === addPath.trim() ? '添加中…' : '添加路径')), candidates === null
        ? React.createElement('div', { className: 'dshdc-center' }, '扫描中…')
        : candidates.length === 0
            ? React.createElement('div', { className: 'dshdc-center' }, '未发现其他 Dockerfile 模块')
            : candidateRows) : null, React.createElement('div', { className: 'dshdc-side-list' }, projects === null ? React.createElement('div', { className: 'dshdc-center' }, '扫描中…') : projectRows.length > 0 ? projectRows : React.createElement('div', { className: 'dshdc-center' }, '未发现 Dockerfile 项目'))), React.createElement('div', { className: 'dshdc-body' }, React.createElement('div', { className: 'dshdc-bar' }, React.createElement('span', { className: 'dshdc-title' }, tab === 'terminal' && termContainer !== ''
        ? '终端 · ' + termContainer.slice(0, 12)
        : (currentConn !== null ? currentConn.name : 'Docker')), currentConn !== null && currentConn.connected && currentConn.engine !== undefined && currentConn.engine.version !== undefined
        ? React.createElement('span', { className: 'dshdc-list-meta' }, 'Docker ' + currentConn.engine.version)
        : React.createElement('span', { className: 'dshdc-list-meta' }, currentConn !== null && !currentConn.connected ? '未连接' : ''), React.createElement('span', { className: 'dshdc-spacer' }), ['images', 'containers', 'jobs', 'terminal'].map((t) => React.createElement('button', {
        key: t, type: 'button',
        className: tab === t ? 'dshdc-btn dshdc-btn-on' : 'dshdc-btn',
        onClick: () => { if (t === 'terminal')
            setTermContainer(''); setTab(t); },
    }, t === 'images' ? '镜像' : t === 'containers' ? '容器' : t === 'jobs' ? '任务' : '终端'))), React.createElement('div', { className: 'dshdc-actions' }, React.createElement('span', { className: 'dshdc-actions-label' }, '构建'), React.createElement('select', {
        className: 'dshdc-input', style: { width: 170 }, value: buildDir,
        onChange: (e) => setBuildDir(e.target.value),
    }, React.createElement('option', { value: '' }, '选择项目…'), (projects ?? []).map((p) => React.createElement('option', { key: p.dir, value: p.dir }, p.name))), input(buildTag, '镜像 tag', setBuildTag, 160), React.createElement('button', { type: 'button', className: 'dshdc-btn', disabled: buildDir === '' || buildTag.trim() === '', onClick: doBuild }, '构建'), React.createElement('span', { className: 'dshdc-sep' }), React.createElement('span', { className: 'dshdc-actions-label' }, '拉取'), input(pullImage, '镜像名:tag', setPullImage, 160), React.createElement('button', { type: 'button', className: 'dshdc-btn', disabled: pullImage.trim() === '', onClick: doPull }, '拉取'), React.createElement('span', { className: 'dshdc-sep' }), React.createElement('span', { className: 'dshdc-actions-label' }, '运行'), input(runImage, '镜像名:tag', setRunImage, 140), input(runName, '容器名', setRunName, 100), input(runPorts, '端口 8080:80,3000:3000', setRunPorts, 150), input(runEnv, '环境变量 KEY=VALUE', setRunEnv, 150), React.createElement('button', { type: 'button', className: 'dshdc-btn', disabled: runImage.trim() === '', onClick: doRun }, '运行')), tab === 'terminal'
        ? React.createElement('div', { className: 'dshdc-terminal' }, content)
        : React.createElement('div', { className: 'dshdc-content' }, content)));
}
