import * as React from 'react';
import { FilesView } from './files-view.js';
import { ensureCss } from './styles.js';
export const name = 'dsh-workspace-files';
export function apply(ctx) {
    const slots = ctx.get('slots');
    if (slots === undefined)
        return;
    const workspaces = ctx.get('workspaces');
    ensureCss();
    slots.inject('conversation.view', () => slots.register({ name: 'conversation.view', id: 'files', order: 11, label: () => '文件' }, (props) => React.createElement(FilesView, { ...props, workspaces })));
}
