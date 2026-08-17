# dsh-workspace-toolbox

> DSH（DeepSeek Harness）Web UI 的工作区工具箱插件 —— 文件浏览、Docker 与 Vite 项目管控，一体集成在会话内。

在会话视图栏的“轨迹”标签之后新增一个**「工具箱」**页签（`对话 | 轨迹 | 工具箱`），内含四个模式：**文件**、**Docker**、**Vite**、**终端**。

---

## 功能总览

| 模式 | 能力 |
| --- | --- |
| 📁 文件 | 面包屑一层一屏目录浏览、全工作区搜索、彩色类型图标、VS Code 风格多标签预览（语法高亮 / Markdown 渲染 / 图片 / 二进制） |
| 🐳 Docker | 本地 unix socket / SSH 隧道远程连接、镜像与容器管理、拉取/构建/运行长任务、容器日志 |
| ⚡ Vite | 工作区 Vite 前端项目扫描、dev server 启动/停止管控、实时日志与访问地址 |
| 🖥️ 终端 | 进入 SSH 服务器（PTY）、进入 docker 容器（exec PTY）、本地 shell |

---

## 模式详解

### 📁 文件

- **面包屑导航**：每屏只显示当前一层目录，点击目录进入、`←` 返回上级、面包屑任意段可跳转，窄屏同样好用；
- **全工作区搜索**：筛选框输入即搜（忽略 `node_modules`/`.git` 等噪音目录，深度 12、访问 6000、结果 200 上限），点击结果目录直接进入；
- **文件图标**：按扩展名显示彩色类型缩写（约 40 种：`JS` `TS` `PY` `GO` `{}` `MD` `ZIP` `IMG` `PDF` 等）；
- **多标签预览**（浏览器式标签页，上限 10 个、自动淘汰最旧）：
  - 文本：行号槽 + 语法高亮（[highlight.js](https://highlightjs.org/) 内联 core + 22 种语言）；
  - Markdown：默认渲染视图（[marked](https://marked.js.org/) GFM + [DOMPurify](https://github.com/cure53/DOMPurify) 消毒防 XSS），可切换源码视图；
  - 图片直接渲染；二进制提示类型与大小；
- 双击文件在系统中打开；预览有上限保护（文本 256KB/3000 行、图片 ≤3MB）。

### 🐳 Docker

- **连接管理**：本机 unix socket；远程经 **SSH 隧道**（复用密码/私钥，不改服务器 docker 配置）；
  - 连接元数据（不含秘密）持久化，重启后可通过「连接」按钮一键重连（私钥认证）或删除；
- **镜像**：列表、删除、拉取（实时进度）；
- **容器**：列表、日志、启动/停止/删除、**进入容器终端**（docker exec PTY）；
- **构建/运行**：工作区 Dockerfile 项目联动，构建上下文打包、运行参数（端口/环境变量）；
- **长任务**：任务注册表 + 日志轮询，pull/build/run/stop/remove 全程进度可见。

### ⚡ Vite

- 自动扫描工作区内带 `vite` 依赖或 `vite.config.*` 的项目（深度 ≤5、忽略噪音目录）；
- **启动**：项目目录执行 `pnpm run dev`（命令可编辑，如 `pnpm --filter xx dev`），日志实时回显，自动解析端口与访问地址；
- **停止**：整进程树结束（Windows `taskkill /T`，POSIX 进程组）；
- 状态每 2 秒轮询，一键新标签页打开页面；插件卸载 / profile 退出时自动结束所有运行中的 dev server。

### 🖥️ 终端

- **服务器终端**：已连接的 SSH 连接 → 打开带 PTY 的 shell 通道，直接进入服务器（支持 `vim`/`top` 等交互程序）；
- **容器终端**：运行中容器行上的「终端」→ `docker exec` 进入容器 shell；
- **本地终端**：本地连接 → 打开本地 shell；
- 基于 [xterm.js](https://xtermjs.org/)：真终端渲染、尺寸自适应、滚动回看。

---

## 安装

要求 DSH `0.1.0-rc.6` 或兼容的 DSH Web profile，以及已安装 [pnpm](https://pnpm.io/)。安装后**重启 Web profile** 生效（`dsh web`），在会话顶部的视图标签中点击「工具箱」。

> 纯 Client 侧改动（`src/client/*`）重建 bundle 后由 client-hmr 自动热更新，无需重启。

### 方式一：tag 归档安装（推荐，开箱即用）

直接使用随 tag 提交的 `lib/` 构建产物，无需本地构建：

```bash
dsh plugin --profile web add https://github.com/wuyh/dsh-workspace-toolbox/archive/refs/tags/v0.3.0.tar.gz
```

### 方式二：git 源码安装（自动构建）

拉取源码并在 `prepare` 阶段自动构建（需要网络与 Node.js 18+）：

```bash
dsh plugin --profile web add github:wuyh/dsh-workspace-toolbox
```

pnpm ≥10 默认拦截依赖构建脚本；首次安装若提示，需在 profile 的 `pnpm-workspace.yaml` 中为 `allowBuilds` 授权（添加 `ssh2: true`）。

### 方式三：本地 link 安装（改源码即可迭代）

```bash
# 克隆或进入仓库目录
git clone https://github.com/wuyh/dsh-workspace-toolbox.git
cd dsh-workspace-toolbox
pnpm install          # 安装依赖并构建 lib/

# 在仓库的上级目录执行（link: 引用仓库路径）
cd ..
dsh plugin --profile web add link:./dsh-workspace-toolbox
```

改 `src/` 后 `pnpm run build` 即可；Host 侧改动需重启 profile，Client 侧自动热更新。

### 网络提示（可选）

若无法直接访问 GitHub，请先为终端配置代理，例如：

```bash
export https_proxy=http://127.0.0.1:7897
export http_proxy=http://127.0.0.1:7897
```

或手动下载 tar 包后在本地安装：

```bash
# 下载 https://github.com/wuyh/dsh-workspace-toolbox/archive/refs/tags/v0.3.0.tar.gz
dsh plugin --profile web add ./dsh-workspace-toolbox-v0.3.0.tar.gz
```

---

## 安全模型

- 浏览器端只收到工作区**相对路径**与最小元数据（名称、类型、大小）；
- Host 侧所有读取都做工作区边界校验（`..` 逃逸、越界符号链接被拒绝）；
- 文件面**只读**：不提供任何写入/修改文件的能力；
- Docker/Vite/终端能力仅在用户显式操作时执行（启动/停止/连接/进入容器）；
- SSH 密码/私钥口令只保存在运行时内存，重启后需重新输入。

---

## 架构与仓库结构

- 源码 `src/`（TypeScript，按职责拆分小模块），构建产物 `lib/`（随 tag 提交）；
- Host 面注册同源 HTTP 路由 + WebSocket 升级路由，Client 面是同源 fetch / WebSocket；
- Client bundle 由 `scripts/build-client.mjs` 进程内打包（内联 highlight.js/marked/dompurify/xterm，react 透传共享实例）。

```text
src/
  index.ts               Host 入口：注册文件/Docker/Vite 路由与终端升级路由
  contract.ts            Host/Client 共享的路由与参数名契约
  host/
    services.ts          fs/agents/webServer 等最小类型面 + Context 扩展
    workspace.ts         会话工作区根目录解析（agent cwd → session cwd → 沙箱根）
    files.ts             单层列表 / 全工作区搜索 / 带边界的只读预览
    docker/
      engine.ts          Docker Engine API 客户端（unix socket / SSH 隧道，含 exec hijack 流）
      manager.ts         连接管理器（本地 + SSH 隧道，元数据持久化）
      routes.ts          Docker HTTP 路由（镜像/容器/构建/运行/任务）
      jobs.ts            长任务注册表（pull/build/run/stop/remove）
      projects.ts        Dockerfile 项目扫描
      ssh-tunnel.ts      SSH 隧道（stream-local 转发 docker socket）
      terminal.ts        终端 WebSocket 升级路由（SSH shell / 本地 shell / 容器 exec）
    vite/
      projects.ts        Vite 项目扫描
      manager.ts         dev server 进程管理（启动/停止/日志/URL 解析）
      routes.ts          Vite HTTP 路由
  client/
    index.ts             浏览器入口：注册“工具箱”页签
    files-view.ts        文件视图（面包屑/搜索/多标签预览）
    docker-view.ts       Docker 面板（连接/镜像/容器/任务/终端）
    docker-terminal.ts   xterm.js 终端组件
    docker-rpc.ts        Docker RPC 封装
    vite-view.ts         Vite 面板
    vite-rpc.ts          Vite RPC 封装
    rpc.ts               文件路由的 fetch 封装
    highlight.ts / markdown.ts / icons.ts / styles.ts / types.ts
scripts/
  build-client.mjs       tsc API 进程内打包 client（内联第三方库，react 透传）
  dev.mjs                开发监视器（改 src/ 自动重建 + client-hmr 热更新）
cordis.patch.yml         组合包 patch：把 Host 行挂进 profile
lib/                     构建产物（tsc 输出 + client bundle）
```

---

## 开发

要求 Node.js 18+ 和 pnpm：

```bash
pnpm install

# TypeScript 类型检查
pnpm run typecheck

# 构建 Host（tsc）与浏览器 bundle
pnpm run build

# 校验 lib/client.js 与源码同步
pnpm run check:client
```

发布路径：

- **tag 归档安装**：直接使用提交的 `lib/` 产物，不执行构建脚本；
- **git 安装**（`dsh plugin add github:wuyh/dsh-workspace-toolbox`）：拉源码并在 `prepare` 中构建；pnpm ≥10 需在 profile 的 `pnpm-workspace.yaml` 中为 `allowBuilds` 授权。

---

## License

MIT
