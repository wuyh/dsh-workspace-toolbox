/**
 * Docker Engine API 客户端：本地（unix socket）与远程（SSH 隧道通道）
 * 共用同一套 HTTP 语义 —— 连接方式的差异只体现在 Backend 上。
 *
 * 实现最小子集：ping/镜像列表/容器列表/拉取(流式)/构建(流式)/创建/启动/
 * 停止/删除/日志。
 */
import http from 'node:http';
import { dockerSocket } from './ssh-tunnel.js';
const LOCAL_SOCKET = '/var/run/docker.sock';
const REMOTE_SOCKET = '/var/run/docker.sock';
function httpRequest(backend, method, path, headers = {}, body) {
    return new Promise((resolve, reject) => {
        const options = {
            method,
            path,
            headers: { Host: 'docker', ...headers },
        };
        if (backend.kind === 'local') {
            options.socketPath = LOCAL_SOCKET;
        }
        else {
            options.createConnection = () => dockerSocket(backend.conn, REMOTE_SOCKET);
        }
        const req = http.request(options, (res) => resolve(res));
        req.on('error', reject);
        if (body !== undefined)
            req.write(body);
        req.end();
    });
}
async function readAll(stream) {
    const chunks = [];
    for await (const chunk of stream)
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    return Buffer.concat(chunks);
}
/** 普通 JSON 请求；非 2xx 抛 DockerError。 */
export async function dockerJson(backend, method, path, payload) {
    const headers = {};
    let body;
    if (payload !== undefined) {
        headers['content-type'] = 'application/json';
        body = Buffer.from(JSON.stringify(payload));
    }
    const res = await httpRequest(backend, method, path, headers, body);
    const buf = await readAll(res);
    if (res.statusCode === undefined || res.statusCode < 200 || res.statusCode >= 300) {
        const error = new Error(`docker ${method} ${path} -> HTTP ${res.statusCode}`);
        error.status = res.statusCode;
        error.body = buf.toString('utf8').slice(0, 4000);
        throw error;
    }
    if (buf.length === 0)
        return {};
    return JSON.parse(buf.toString('utf8'));
}
/**
 * 流式请求（pull/build 等）：逐行回调原始 JSON 进度对象，
 * 结束时返回整体状态码；用于任务日志的实时追加。
 */
export function dockerStream(backend, method, path, body, headers, onLine) {
    return new Promise((resolve, reject) => {
        httpRequest(backend, method, path, headers, body).then((res) => {
            let remainder = '';
            res.on('data', (chunk) => {
                remainder += chunk.toString('utf8');
                let idx;
                while ((idx = remainder.indexOf('\n')) >= 0) {
                    const line = remainder.slice(0, idx).trim();
                    remainder = remainder.slice(idx + 1);
                    if (line !== '')
                        onLine(line);
                }
            });
            res.on('end', () => {
                if (remainder.trim() !== '')
                    onLine(remainder.trim());
                resolve({ status: res.statusCode ?? 0 });
            });
            res.on('error', reject);
        }).catch(reject);
    });
}
export function parsePortBinding(text) {
    const m = /^(\d+):(\d+)$/.exec(text.trim());
    if (m === null)
        return null;
    return { host: m[1] ?? '', container: m[2] ?? '' };
}
export function containerCreatePayload(image, opts) {
    const exposed = {};
    const bindings = {};
    for (const raw of opts.ports ?? []) {
        const binding = parsePortBinding(raw);
        if (binding === null)
            continue;
        exposed[binding.container + '/tcp'] = {};
        bindings[binding.container + '/tcp'] = [{ HostPort: binding.host }];
    }
    const payload = { Image: image };
    if (opts.name !== undefined && opts.name.trim() !== '')
        payload.name = opts.name.trim();
    const env = (opts.env ?? []).filter((e) => e.trim() !== '');
    if (env.length > 0)
        payload.Env = env;
    if (Object.keys(exposed).length > 0) {
        payload.ExposedPorts = exposed;
        payload.HostConfig = { PortBindings: bindings };
    }
    return payload;
}
export function formatDockerProgress(line) {
    try {
        const obj = JSON.parse(line);
        if (obj.error !== undefined)
            return '错误: ' + (obj.errorDetail?.message ?? obj.error);
        if (obj.stream !== undefined)
            return obj.stream.replace(/\n$/, '');
        if (obj.status !== undefined) {
            const id = obj.id !== undefined && !obj.id.startsWith('sha256:') ? obj.id : '';
            if (obj.progress !== undefined)
                return `${obj.status} ${id}: ${obj.progress}`.trim();
            return `${obj.status} ${id}`.trim();
        }
        return line.slice(0, 400);
    }
    catch {
        return line.slice(0, 400);
    }
}
/** 去掉 docker 日志流的 8 字节帧头（stream 多路复用），拼成纯文本。 */
function demuxDockerLogs(buf) {
    let out = '';
    let i = 0;
    while (i + 8 <= buf.length) {
        const size = buf.readUInt32BE(i + 4);
        if (size < 0 || i + 8 + size > buf.length)
            break;
        out += buf.toString('utf8', i + 8, i + 8 + size);
        i += 8 + size;
    }
    return out;
}
export const docker = {
    ping: (b) => dockerJson(b, 'GET', '/_ping'),
    version: (b) => dockerJson(b, 'GET', '/version'),
    listImages: (b) => dockerJson(b, 'GET', '/images/json'),
    listContainers: (b) => dockerJson(b, 'GET', '/containers/json?all=1'),
    createContainer: (b, payload) => dockerJson(b, 'POST', '/containers/create', payload),
    startContainer: (b, id) => dockerJson(b, 'POST', `/containers/${id}/start`),
    stopContainer: (b, id) => dockerJson(b, 'POST', `/containers/${id}/stop`),
    removeContainer: (b, id) => dockerJson(b, 'DELETE', `/containers/${id}?force=1`),
    containerLogs: async (b, id) => {
        const res = await httpRequest(b, 'GET', `/containers/${id}/logs?stdout=1&stderr=1&tail=200`);
        const buf = await readAll(res);
        return demuxDockerLogs(buf);
    },
    removeImage: (b, id) => dockerJson(b, 'DELETE', `/images/${id}?force=1`),
    pull: (b, image, onLine) => {
        const [name, tag] = image.includes(':') ? image.split(':', 2) : [image, 'latest'];
        const query = `fromImage=${encodeURIComponent(name ?? image)}&tag=${encodeURIComponent(tag ?? 'latest')}`;
        return dockerStream(b, 'POST', `/images/create?${query}`, undefined, {}, onLine);
    },
    build: (b, tar, tag, onLine) => {
        const query = `t=${encodeURIComponent(tag)}`;
        return dockerStream(b, 'POST', `/build?${query}`, tar, { 'content-type': 'application/x-tar' }, onLine);
    },
};
