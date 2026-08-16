export async function resolveRoot(ctx, sessionId) {
    let rootPath = '';
    const agent = ctx.agents.get(sessionId);
    if (agent && typeof agent.session.header.cwd === 'string') {
        rootPath = agent.session.header.cwd;
    }
    if (rootPath === '') {
        const session = ctx.sessions?.get(sessionId);
        if (session && typeof session.header.cwd === 'string')
            rootPath = session.header.cwd;
    }
    if (rootPath === '') {
        const policy = ctx.sandboxPolicy;
        if (policy !== undefined && typeof policy.workspaceRoot === 'string')
            rootPath = policy.workspaceRoot;
    }
    if (rootPath === '')
        return { error: 'NO_WORKSPACE' };
    try {
        return { rootPath, root: await ctx.fs.resolve(rootPath) };
    }
    catch {
        return { error: 'NOT_FOUND' };
    }
}
