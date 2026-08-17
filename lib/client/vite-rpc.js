const PREFIX = '/dsh-workspace-toolbox/vite';
async function get(route) {
    const res = await fetch(route);
    return res.json();
}
async function post(route, body) {
    const res = await fetch(route, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
    });
    return res.json();
}
export const viteRpc = {
    projects: (session) => get(PREFIX + '/projects?session=' + encodeURIComponent(session)),
    status: () => get(PREFIX + '/status'),
    start: (session, dir, command) => post(PREFIX + '/start', { session, dir, command }),
    stop: (key) => post(PREFIX + '/stop', { key }),
};
