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

- **单击**文件在右侧打开预览：文本文件带**行号槽**并做语法高亮（支持 JS/TS、Python、Go、Rust、C/C++/Java/C#、CSS、HTML/Vue/Svelte、JSON、YAML、Shell、SQL、Markdown、XML、INI）；图片（png/jpg/gif/webp/svg/bmp 等）直接渲染；二进制文件提示类型与大小；
- **双击**文件用系统默认应用打开；
- 预览内容有上限保护（文本前 256KB / 3000 行，图片 ≤3MB），大文件不会拖垮页面。

## 安装

要求 DSH `0.1.0-rc.6` 或兼容的 DSH Web profile。通过官方 profile 插件流安装：

```bash
dsh plugin --profile web add https://github.com/<owner>/dsh-workspace-files/archive/refs/tags/v0.1.0.tar.gz
```

安装完成后**重启 Web profile** 生效（`dsh web`），在会话顶部的视图标签中点击“文件”即可。

## 安全模型

- 浏览器端只收到工作区**相对路径**与最小元数据（名称、类型、大小）；
- Host 侧每次读取都做工作区边界校验（`..` 逃逸、越界符号链接会被拒绝）；
- 仅只读操作：本插件不提供任何写入/修改文件的能力。

## 仓库结构

```text
lib/
  index.js      Host 入口：工作区解析 + 4 个只读 HTTP 路由
  client.js     浏览器入口：面包屑浏览 + 搜索 + 预览 + 语法高亮
cordis.patch.yml
package.json
```

## License

MIT
