# Birthday Photo - 3D 电子相册项目 🎄🎂💖🎉

一个极致奢华、高度互动的 3D 沉浸式电子相册系统。基于 **Next.js 16 (Turbopack) + React Three Fiber + Drei** 展示前端，与 **Refine + React 19 + Ant Design** 后台管理端，并由本地 **Supabase (Docker)** 提供数据和存储支持。

---

## 🌟 核心视觉与功能特性

1. **极致 3D 展示效果**：
   - 🎄 **圣诞模式 (Christmas)**: 3D 挂饰圣诞树、梦幻飘雪特效、浪漫圣诞彩灯。
   - 🎂 **生日模式 (Birthday)**: 漂浮气球、带有闪烁烛光的三层奶油生日蛋糕。
   - 💖 **浪漫模式 (Romantic)**: 精美双人起舞模型、粉色粒子微光、爱心环绕。
   - 🎉 **派对模式 (Party)**: 绚丽烟花粒子特效、动态变色炫光。
2. **动态多端光影与中文支持**：
   - 注入 **ZCOOL Chinese 艺术字体**（**自托管**于 `apps/web/public/fonts/`，不依赖 Google Fonts CDN，内网 / 离线环境同样可用），完美呈现中文场景名和欢迎语，拒绝中文字符方块乱码。
   - **本地烘焙的 IBL 环境光**：用 `<Environment>` + `<Lightformer>` 在本地生成环境贴图（**零网络请求**），金属相框、水晶玻璃挂饰、圣诞树表面因此有了真实的高光与反射。
   - 包含动态彩色点光源（在场景上空缓慢运动和呼吸），令金属表面的相框、玻璃材质的挂饰产生奢华反光。
3. **真实相册渲染与 CORS 防崩溃兜底**：
   - 采用**引用计数的共享贴图缓存**（`lib/textureCache.ts`），同一张照片只下载一次、只占一份显存，最后一个使用者离开时才释放；网络延迟、404 或 CORS 跨域错误时自动降级到自托管占位图。
   - 场景所需的字体与贴图**全部自托管**，且每个会异步加载资源的组件都有独立加载边界——任何单个资源加载失败都**不会**导致整个场景空白。
   - **3D 崩溃隔离**：WebGL 上下文丢失或组件抛错时，错误边界接管并给出可读提示与「重新加载」，而不是整页白屏。
4. **本地 Docker Supabase 开箱即用**：
   - 项目提供一键连接本地 Docker 部署的 Supabase 环境配置文件，实现极速本地私有化数据存储。
5. **响应式取景与可访问性**：
   - 相机按视口宽高比反算距离与视场角：桌面、笔记本、手机竖屏都能完整框住舞台，且**保留访客已经转动的视角**。
   - 支持 `prefers-reduced-motion`：访客要求减少动效时，相机自动旋转、气球上升、挂饰漂浮与树灯闪烁都会停下。
6. **企业级 CI/CD 流水线**：
   - 配置好完整的 GitHub Actions 打包流水线，自动检测多端编译兼容性。
   - E2E 除了断言「场景标题可见」外，还**逐像素检查画面不是纯色**，能抓住「场景提交了但什么都没画」这类回归。

---

## 📂 项目结构

```
birthday-photo/
├── .github/workflows/  # CI/CD 自动化流水线
│   └── build-and-test.yml
├── apps/
│   ├── admin/          # 后台管理系统 (Vite + Refine + Antd)
│   │   ├── Dockerfile
│   │   └── src/
│   └── web/            # 前端 3D 展示 (Next.js 16 + R3F)
│       ├── Dockerfile  # Next.js 多阶段生产打包文件
│       └── app/
├── database/           # 本地 Supabase 初始化数据库脚本
│   ├── schema.sql
│   ├── policy.sql
│   ├── test_data.sql
│   └── migrations/     # 存量数据库的增量迁移脚本
├── scripts/            # 仓库级脚本（dev.mjs / 场景审计 scene-audit.mjs 等）
├── tests/              # 单元测试 (node:test) 与 Playwright E2E
├── AGENTS.md           # AI 智能体开发规范与协作指南
├── docker-compose.yml  # Docker 容器编排文件
└── README.md           # 本说明文件
```

---

## 🚀 极速本地配置与运行

### 1. 配置环境变量 (本地 Docker Supabase)

项目已预配置好连接本地 Docker 部署的 Supabase。请在以下路径创建 `.env` 文件：

- **根目录 `.env`** & **展示端 `apps/web/.env.local`**：
  ```env
  NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<您的本地Supabase-Anon-Key>
  ```
- **管理端 `apps/admin/.env`**：
  ```env
  VITE_SUPABASE_URL=http://localhost:54321
  VITE_SUPABASE_ANON_KEY=<您的本地Supabase-Anon-Key>
  VITE_WEB_URL=http://localhost:3000
  ```

### 2. 数据库与 Storage 初始化
1. 打开本地部署的 Supabase Dashboard (通常为 `http://localhost:54323`)。
2. 进入 SQL Editor，依次运行 `database/schema.sql`、`database/policy.sql`、
   `database/storage.sql` 和 `database/test_data.sql`。
   `storage.sql` 会幂等地创建 `photos`（仅图片）与 `music`（仅音频）两个 Public Bucket
   及其读写策略，无需再在 Dashboard 里手动建桶。

> 已有数据库升级：再运行一次 `database/migrations/001_settings_defaults.sql`，
> 它会幂等地补上 `default_scene_id` / `default_mode` / `default_layout` 三个落幕配置字段。

### 3. 一键开发运行
本仓库的两个应用各自独立安装依赖（各自持有 lockfile），根目录提供统一入口：

```bash
# 安装全部依赖（web + admin + 根目录工具链）
pnpm install:all

# 同时启动 3D 展示端与后台管理端
pnpm dev
```

也可以单独启动：

```bash
pnpm dev:web     # http://localhost:3000
pnpm dev:admin   # http://localhost:5173
```

- **3D 展示前端**: [http://localhost:3000](http://localhost:3000)
- **后台管理系统**: [http://localhost:5173](http://localhost:5173) (使用 Supabase 认证登录；Docker 部署时为 `http://localhost:8080`)

### 4. 常用校验命令
```bash
pnpm typecheck     # 前后端类型检查
pnpm test:unit     # 纯逻辑单元测试 (node:test)
pnpm test:e2e      # Playwright E2E
pnpm build         # 双端生产构建
```

### 5. 3D 场景审计（改完 3D 请跑一次）

改 3D 最怕「代码看起来对，画面其实不对」。`pnpm audit:scene` 会驱动真实浏览器
逐个切换四种场景模式、**逐个截屏**，并统计 WebGL 的**每帧 draw call**：

```bash
pnpm dev:web                                  # 另开一个终端
pnpm audit:scene                              # 桌面 1440x900
pnpm audit:scene -- --viewport 390x844        # 手机竖屏
pnpm audit:scene -- --modes christmas,romantic
```

产物在 `.scene-audit/<name>/`（PNG + `report.json`）。draw call 是确定性指标，
最适合用来对比性能改动的前后差异。

---

## 🛠️ Docker 容器化构建与部署

本项目已适配好 Docker 一键编排。您可以直接在根目录打包：
```bash
# 构建并运行 web 与 admin 容器
docker-compose up --build -d
```
- 容器启动后，展示端运行于 `http://localhost:3000`，后台管理端运行于 `http://localhost:8080`。

---

## 📄 许可证 (License)

本项目基于 **[MIT License](https://opensource.org/licenses/MIT)** 协议开源。

```
MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🤖 智能体开发协同 (AI Autopilot)
关于如何利用 AI 协同开发（如使用 `/goal` 进行长周期重构，或使用 `/grill-me` 敲定设计思路），请参阅 [AGENTS.md](./AGENTS.md)。
