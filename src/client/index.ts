/**
 * dsh-workspace-files 浏览器端入口。
 *
 * 挂在官方的 additive 扩展面上：在会话视图环（conversation.view）注册
 * 一个“文件”页签（紧跟“轨迹”之后），内含文件浏览与 Docker 服务两个模式。
 */
import type { Context } from '@deepseek-ai/cordis'
import * as React from 'react'
import { FilesView } from './files-view.js'
import { ensureCss } from './styles.js'
import type { SlotRegistry, WorkspacesService } from './types.js'

export const name = 'dsh-workspace-files'

export function apply(ctx: Context): void {
  const slots = ctx.get('slots') as unknown as SlotRegistry | undefined
  if (slots === undefined) return
  const workspaces = ctx.get('workspaces') as unknown as WorkspacesService | undefined
  ensureCss()
  slots.inject('conversation.view', () => slots.register(
    { name: 'conversation.view', id: 'files', order: 11, label: () => '文件' },
    (props) => React.createElement(FilesView, { ...props, workspaces }),
  ))
}
