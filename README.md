# dsh-workspace-files

DSH Web UI 的工作区文件管理器插件。在会话视图栏的“轨迹”标签之后新增一个“文件”页签，以**面包屑一层一屏**的方式浏览当前会话工作区的文件，支持全工作区搜索、按扩展名着色图标、VS Code 风格的代码预览与语法高亮。

## 功能

### 目录浏览（面包屑导航）

- 每屏只显示**当前一层**目录，点击目录进入，`←` 返回上一级，顶部面包屑任意段可点击跳转 —— 窄屏（手机/平板）同样好用；
- 目录树可折叠隐藏（☰），工作区路径、筛选、刷新、打开目录位于顶部工具栏；
- 已访问层级缓存，切换“对话/轨迹/文件”标签后目录位置与预览状态自动保留。

### 全工作区搜索

在筛选框输入关键字即搜索整个工作区（忽略 `node_modules`、`.git` 等噪音目录，深度 12、访问 6000、结果 200 上限），点击结果目录直接进入该目录。

### 文件图标

按扩展名显示彩色类型缩写图标（约 40 种）：`JS` `TS` `PY` `GO` `{}`(JSON) `MD` `ZIP` `IMG` `PDF` 等。

### 预览

- **单击**文件在右侧打开预览，多个文件以**浏览器式标签页**并存（点击切换、× 关闭、上限 10 个，超出自动淘汰最旧标签）：
  - 文本文件带**行号槽**并做语法高亮 —— 基于 [highlight.js](https://highlightjs.org/)（内联 core + 22 种语言：JS/TS、Python、Go、Rust、C/C++/C#、Java/Kotlin/Swift、CSS/SCSS/Less、XML/HTML、JSON、YAML、Shell、SQL、INI、Markdown 等）；
  - **Markdown** 默认以**渲染视图**展示（[marked](https://marked.js.org/) GFM 解析 + [DOMPurify](https://github.com/cure53/DOMPurify) 消毒防 XSS），标题栏可一键切换“源码”视图；
  - 图片（png/jpg/gif/webp/svg/bmp 等）直接渲染；二进制文件提示类型与大小；
- **双击**文件用系统默认应用打开；
- 预览内容有上限保护（文本前 256KB / 3000 行，图片 ≤3MB），大文件不会拖垮页面。

## 截图

<!-- TODO: 待补充真实截图（放入 docs/ 目录并在下面引用） -->

## 安装

要求 DSH `0.1.0-rc.6` 或兼容的 DSH Web profile。通过官方 profile 插件流安装：

```bash
dsh plugin --profile web add https://github.com/wuyh/dsh-workspace-files/archive/refs/tags/v0.2.0.tar.gz
```

安装完成后**重启 Web profile** 生效（`dsh web`），在会话顶部的视图标签中点击“文件”即可。

## 安全模型

- 浏览器端只收到工作区**相对路径**与最小元数据（名称、类型、大小）；
- Host 侧每次读取都做工作区边界校验（`..` 逃逸、越界符号链接会被拒绝）；
- 仅只读操作：本插件不提供任何写入/修改文件的能力。

## 仓库结构

源码在 `src/`（TypeScript，按职责拆分为可读的小模块），构建产物在 `lib/`（随 tag 提交，安装 tag 归档时直接使用构建产物，无需执行构建脚本）：

```text
src/
  index.ts            Host 入口：注册 4 个只读 HTTP 路由
  contract.ts         Host/Client 共享的路由与参数名契约
  host/
    services.ts       fs/agents/webServer 等最小类型面 + Context 扩展
    workspace.ts      会话工作区根目录解析（agent cwd → session cwd → 沙箱根）
    files.ts          单层列表 / 全工作区搜索 / 带边界的只读预览
  client/
    index.ts          浏览器入口：注册“文件”视图页签
    files-view.ts     视图组件：面包屑导航、搜索、预览、状态持久化
    rpc.ts            Host 路由的同源 fetch 封装
    highlight.ts      highlight.js 封装（core + 22 种语言注册、扩展名映射）
    markdown.ts       Markdown 渲染（marked + DOMPurify 消毒）
    icons.ts          按扩展名的彩色类型图标
    styles.ts         插件样式 + hljs 主题 + Markdown 样式，幂等注入
    types.ts          Client 侧线格式与服务面类型
scripts/
  build-client.mjs    tsc API 进程内打包 client（内联 highlight.js/marked/dompurify，react 透传共享实例）
  dev.mjs             开发监视器：改 src/ 自动重建（配合 link 安装 + client-hmr 热更新）
cordis.patch.yml      组合包 patch：把 Host 行挂进 profile
lib/                  构建产物（tsc 输出 + client bundle，随 tag 提交）
```

## 开发

要求 Node.js 18+ 和 pnpm：

```bash
pnpm install

# TypeScript 类型检查
pnpm run typecheck

# 构建 Host（tsc）与浏览器 bundle（scripts/build-client.mjs）
pnpm run build

# 校验 lib/client.js 与源码同步
pnpm run check:client
```

两个发布路径：

- **tag 归档安装**（README 推荐的安装方式）直接使用提交的 `lib/` 产物，不执行任何脚本；
- **git 安装**（`dsh plugin add github:you/dsh-workspace-files`）会拉源码并在 `prepare` 中构建；pnpm ≥10 需要先按提示在 profile 的 `pnpm-workspace.yaml` 中为 `allowBuilds` 授权。

## License

MIT
