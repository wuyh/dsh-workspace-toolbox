import * as React from 'react';
import { FilesView } from './files-view.js';
import { ensureCss } from './styles.js';
export const name = 'dsh-workspace-toolbox';
export function apply(ctx) {
    const slots = ctx.get('slots');
    if (slots === undefined)
        return;
    const workspaces = ctx.get('workspaces');
    ensureCss();
    slots.inject('conversation.view', () => slots.register({ name: 'conversation.view', id: 'toolbox', order: 11, label: () => '工具箱' }, (props) => React.createElement(FilesView, { ...props, workspaces })));
}
