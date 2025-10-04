# PDF Viewer H5

一个基于 Vue 3 + Vite + pdfjs-dist 的轻量 H5 PDF 在线预览与下载示例，支持通过地址栏参数或输入框加载任意可公开访问的 PDF 链接，并提供分页与缩放操作。项目包含一个用于绕过 CORS 的简单反向代理（EdgeOne Pages Functions）。

![iShot_2025-10-04_22.10.40.png](https://r2.airmole.cn/i/2025/10/04/1bk46p-9q.png)

- [在线预览](https://pdfviewer.airmole.cn/)
- [源码](https://github.com/airmole/pdf-viewer-h5)

## 功能特性

- 在线预览公开可访问的 PDF
- 地址栏参数直达：`?url=PDF直链`
- 基本阅读控制：上一页/下一页、缩放
- 一键下载原始 PDF（自动推断文件名）
- 简单 CORS 代理（EdgeOne Pages Functions）

## 技术栈

- 前端：Vue 3、Vite
- PDF 渲染：pdfjs-dist (PDF.js)
- 路由：vue-router
- 代理服务：EdgeOne Pages Functions

## 目录结构

```
pdf-viewer-h5
├── functions/            # EdgeOne Pages Functions (服务端代理)
│   └── api/
│       └── index.js      # /api?url=... 反向代理以解决 CORS
├── src/
│   ├── components/
│   │   └── PdfViewer.vue # PDF 渲染与分页/缩放
│   ├── App.vue           # UI、输入与下载逻辑
│   └── main.js           # Vue 应用入口与路由
├── index.html
├── vite.config.js
└── package.json
```

## 快速开始

### 环境要求

- Node.js ≥ 18（Vite 5 需要 Node 18+）
- 推荐使用 npm / pnpm / yarn（本文以 npm 为例）

### 安装依赖

```
npm install
```

### 启动本地开发（前端）

```
npm run dev
```

## 启动 API 代理（EdgeOne Pages Functions）

前端默认通过以下地址请求代理：
- `https://pdfviewer.airmole.cn/api?url=` （见 `src/App.vue` 中 `api` 常量）

你可以用 EdgeOne CLI 在本地运行 Pages Functions：

1) 安装 EdgeOne CLI
```
npm install -g edgeone 
```

2) 本地启动 Pages Functions
```
edgeone pages dev
```

- 启动成功后，`/api?url=...` 将通过 `functions/api/index.js` 进行反代到真实 PDF 链接，并设置 `Content-Type: application/pdf` 与 CORS 响应头。

### 部署到 EdgeOne Pages（可选）

1) 将仓库连接到 EdgeOne Pages
2) 构建命令：`npm run build`
3) 构建输出目录：`dist`
4) 打开 Pages Functions（框架会自动识别 `functions/` 目录）
5) 部署后，前端与 `/api` 代理会在同一域名下工作

## 构建与预览

- 生产构建：
```
npm run build
```

- 本地预览构建产物：
```
npm run preview
```

## 使用说明

1) 直接在输入框粘贴一个可公开访问的 PDF 直链，点击“加载”
2) 或在地址栏追加 `?url=PDF直链`，示例：
   ```
   http://localhost:8080/?url=https://example.com/sample.pdf
   ```
3) 预览区支持：
   - 上一页 / 下一页
   - 缩放（50% ~ 300%）
4) 点击“下载”将通过代理获取 Blob 并触发浏览器下载
   - 会尽量从响应头 `Content-Disposition` 或原始 URL 推断文件名

## 自定义与扩展

- 修改默认代理地址：编辑 `src/App.vue` 中的
  ```
  const api = ref('https://pdfviewer.airmole.cn/api?url=')
  ```
  建议改造为从环境变量读取，例如结合 Vite 环境变量（`import.meta.env`）与 `.env` 文件。

- Pdf.js 工作线程：
  `src/components/PdfViewer.vue` 已使用 ESM 入口并通过
  ```
  import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url'
  GlobalWorkerOptions.workerSrc = workerUrl
  ```
  正确配置了 worker。若构建环境发生变化，请确保静态资源可被正确加载。

## 常见问题

- 预览空白或跨域错误
  - 确认本地代理已启动：`edgeone pages dev`
  - 确认 `src/App.vue` 的 `api` 地址与代理端口一致
  - 确认目标 PDF 链接可在浏览器直接访问

- 下载失败
  - 检查网络与控制台报错
  - 某些站点可能拒绝跨域或需要特殊头；此示例代理为最简实现，如需复杂逻辑请在 `functions/api/index.js` 中扩展

## 安全与合规

- `functions/api/index.js` 仅用于演示最小可用的 CORS 代理，请勿用于开放匿名任意转发到受限资源的生产环境。
- 请自行审阅并替换示例中默认链接与注释内容，按需添加鉴权、限流、白名单、防盗链等安全措施。
