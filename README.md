# Birthday Photo 3D Gallery

一个基于 React Three Fiber 和 Next.js 的 3D 电子相册项目，包含精美的 3D 场景（圣诞树、蛋糕、礼物、双人天舞等）和一个后台管理系统。

## 项目结构

- `apps/web`: 3D 展示前端 (Next.js)
- `apps/admin`: 后台管理前端 (Vite + React)
- `doc/`: 数据库 Schema 和设计文档

## 功能特性

- **3D 沉浸式体验**: 包含圣诞模式、生日模式、浪漫模式三种场景切换。
- **互动元素**: 可点击查看照片、礼物盒互动动画、背景音乐控制。
- **后台管理**: 管理照片上传、排序和全局设置（背景音乐、问候语等）。
- **多种特效**: 粒子系统（雪花、气球、爱心）、辉光后期处理、动态运镜。

## 快速开始

### 1. 环境变量配置

在项目根目录创建一个 `.env` 文件，填入你的 Supabase 配置信息：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. 数据库设置

请参考 `doc/schema.sql` 和 `doc/schema_settings.sql` 在你的 Supabase 项目中创建所需的表结构。

### 3. Docker 一键部署

确保本地已安装 Docker 和 Docker Compose。

**Windows 用户:**
直接运行根目录下的部署脚本：
```powershell
.\deploy.ps1
```

**Linux/Mac 用户:**
```bash
chmod +x deploy.sh
./deploy.sh
```

或者使用 npm script:
```bash
pnpm deploy
# 或者
npm run deploy
```

启动后：
- **Web 端**: 访问 `http://localhost:3000`
- **Admin 端**: 访问 `http://localhost:8080`

### 4. 本地开发

如果你想在本地分别启动开发服务器：

**安装依赖**
```bash
pnpm install
```

**启动 Web**
```bash
cd apps/web
pnpm dev
```

**启动 Admin**
```bash
cd apps/admin
pnpm dev
```

## 技术栈

- **前端框架**: Next.js 15, React 19, Vite
- **3D 引擎**: Three.js, React Three Fiber, Drei
- **动画**: Framer Motion, React Spring
- **数据库**: Supabase (PostgreSQL)
- **样式**: TailwindCSS
- **部署**: Docker

## 常见问题

### Docker 镜像拉取失败
如果你在中国大陆地区，可能会遇到 Docker Hub 连接超时的问题。本项目已默认配置为使用国内镜像源 (`m.daocloud.io`)。
如果你处于非受限网络环境，可以在 `Dockerfile` 中将 `m.daocloud.io/docker.io/library/` 前缀移除，恢复官方源。
