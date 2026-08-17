/**
 * 终端组件：xterm.js + WebSocket，接入 Host 的 SSH/本地 shell 通道。
 *
 * 用法：放在 Docker 面板的“终端”页签里，connectionId 为当前选中的连接。
 */
import * as React from 'react';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from 'xterm';
const TERMINAL_WS_PATH = '/dsh-workspace-toolbox/docker/terminal';
export function TerminalView(props) {
    const containerRef = React.useRef(null);
    React.useEffect(() => {
        const el = containerRef.current;
        if (el === null)
            return;
        const term = new Terminal({
            cursorBlink: true,
            fontSize: 13,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
            theme: { background: '#0f1115' },
            scrollback: 5000,
        });
        const fit = new FitAddon();
        term.loadAddon(fit);
        term.open(el);
        try {
            fit.fit();
        }
        catch { /* 容器尺寸未就绪 */ }
        const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const url = proto + window.location.host + TERMINAL_WS_PATH
            + '?connection=' + encodeURIComponent(props.connectionId)
            + (props.container !== undefined && props.container !== '' ? '&container=' + encodeURIComponent(props.container) : '');
        const ws = new WebSocket(url);
        // Host 以二进制帧发送通道输出：按 ArrayBuffer 接收，避免 Blob 序列化问题。
        ws.binaryType = 'arraybuffer';
        let disposed = false;
        const sendSize = (kind) => {
            if (ws.readyState !== WebSocket.OPEN)
                return;
            ws.send('\u0000' + kind + JSON.stringify({ cols: term.cols, rows: term.rows }));
        };
        ws.onopen = () => {
            sendSize('init');
            term.focus();
        };
        ws.onmessage = (ev) => {
            if (disposed)
                return;
            if (typeof ev.data === 'string')
                term.write(ev.data);
            else
                term.write(new Uint8Array(ev.data));
        };
        ws.onclose = () => {
            if (!disposed)
                term.write('\r\n\x1b[90m[连接已关闭]\x1b[0m\r\n');
        };
        ws.onerror = () => {
            if (!disposed)
                term.write('\r\n\x1b[90m[连接错误]\x1b[0m\r\n');
        };
        const dataSub = term.onData((d) => {
            if (ws.readyState === WebSocket.OPEN)
                ws.send(d);
        });
        const resizeSub = term.onResize(() => {
            try {
                fit.fit();
            }
            catch { /* 忽略 */ }
            sendSize('resize');
        });
        const ro = new ResizeObserver(() => {
            try {
                fit.fit();
            }
            catch { /* 忽略 */ }
        });
        ro.observe(el);
        return () => {
            disposed = true;
            ro.disconnect();
            dataSub.dispose();
            resizeSub.dispose();
            term.dispose();
            ws.close();
        };
    }, [props.connectionId, props.container]);
    return React.createElement('div', { className: 'dshfm-term', ref: containerRef });
}
