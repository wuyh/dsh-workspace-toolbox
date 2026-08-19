const PREFIX = '/dsh-workspace-toolbox/docker';
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
export const dockerRpc = {
    projects: (session) => get(PREFIX + '/projects?session=' + encodeURIComponent(session)),
    projectsCandidates: (session) => get(PREFIX + '/projects/candidates?session=' + encodeURIComponent(session)),
    projectAdd: (session, path) => post(PREFIX + '/projects/add', { session, path }),
    projectRemove: (session, path) => post(PREFIX + '/projects/remove', { session, path }),
    connections: () => get(PREFIX + '/connections'),
    connect: (spec) => post(PREFIX + '/connect', { spec }),
    disconnect: (id, forget) => post(PREFIX + '/disconnect', { id, forget }),
    images: (connection) => get(PREFIX + '/images?connection=' + encodeURIComponent(connection)),
    containers: (connection) => get(PREFIX + '/containers?connection=' + encodeURIComponent(connection)),
    pull: (connection, image) => post(PREFIX + '/pull', { connection, image }),
    build: (session, connection, dir, tag) => post(PREFIX + '/build', { session, connection, dir, tag }),
    run: (connection, image, name, ports, env) => post(PREFIX + '/run', { connection, image, name, ports, env }),
    stop: (connection, id) => post(PREFIX + '/stop', { connection, id }),
    remove: (connection, id) => post(PREFIX + '/remove', { connection, id }),
    removeImage: (connection, id) => post(PREFIX + '/remove-image', { connection, id }),
    jobs: () => get(PREFIX + '/jobs'),
    job: (id) => get(PREFIX + '/jobs?id=' + encodeURIComponent(id)),
    logs: (connection, id) => get(PREFIX + '/logs?connection=' + encodeURIComponent(connection) + '&id=' + encodeURIComponent(id)),
};
