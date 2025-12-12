# 2. 技术架构 (Technical Architecture)

## 2.1 架构概览
本项目采用 **Monorepo (单体仓库)** 架构，使用 `pnpm` 工作区管理。这种架构允许我们在同一个仓库中同时维护前台展示端 (`apps/web`) 和后台管理端 (`apps/admin`)，方便代码共享和依赖管理。

### 目录结构
```text
root/
├── apps/
│   ├── admin/       # 后台管理端 (Vite + React + Refine)
│   └── web/         # 前台展示端 (Next.js + React Three Fiber)
├── doc/             # 项目文档与数据库 SQL
├── docker-compose.yml # 容器化编排配置
├── pnpm-workspace.yaml # Monorepo 工作区定义
└── package.json     # 根级依赖配置
```

## 2.2 技术栈选型

### 2.2.1 前台展示端 (apps/web)
- **框架**: [Next.js 14+](https://nextjs.org/) (App Router) - 提供服务端渲染 (SSR) 和高效的路由管理。
- **3D 引擎**: [React Three Fiber (R3F)](https://docs.pmnd.rs/react-three-fiber) - React 生态中最流行的 Three.js 封装库。
- **3D 辅助库**: [React Three Drei](https://github.com/pmndrs/drei) - 提供现成的 3D 组件（如 OrbitControls, Environment, Stars）。
- **动画**: [Framer Motion](https://www.framer.com/motion/) - 用于 2D UI 的过渡动画（如弹窗、HUD）。
- **样式**: [Tailwind CSS](https://tailwindcss.com/) - 原子化 CSS，快速构建 UI。
- **状态管理**: React Hooks / Zustand。

### 2.2.2 后台管理端 (apps/admin)
- **框架**: [Refine](https://refine.dev/) - 专为内部工具和后台管理设计的 React 框架，内置了大量 CRUD 逻辑。
- **构建工具**: [Vite](https://vitejs.dev/) - 极速的开发服务器和构建工具。
- **UI 库**: Material UI (MUI) - 成熟的企业级组件库。
- **数据层**: Refine Supabase Data Provider - 自动对接 Supabase 的 API。

### 2.2.3 后端与基础设施 (Backend & Infra)
- **BaaS**: [Supabase](https://supabase.com/) - 开源的 Firebase 替代品，提供 Database, Auth, Storage 等服务。
- **数据库**: PostgreSQL - 关系型数据库，存储业务数据。
- **对象存储**: Supabase Storage - 存储用户上传的照片文件。
- **容器化**: Docker & Docker Compose - 统一开发和部署环境。

## 2.3 系统架构图

```mermaid
graph TD
    User[C端用户] --> |访问| Web[Web App (Next.js)]
    Admin[管理员] --> |访问| AdminApp[Admin App (Refine)]
    
    subgraph Frontend [前端 Monorepo]
        Web
        AdminApp
    end
    
    subgraph Backend [Supabase Cloud/Local]
        API[PostgREST API]
        Auth[GoTrue Auth]
        DB[(PostgreSQL)]
        Storage[Object Storage]
    end
    
    Web --> |读取场景/照片| API
    Web --> |加载图片资源| Storage
    
    AdminApp --> |CRUD操作| API
    AdminApp --> |上传文件| Storage
    AdminApp --> |身份验证| Auth
    
    API --> DB
```

## 2.4 数据流向
1.  **上传流程**：管理员在 Admin 端上传图片 -> 图片存入 Supabase Storage -> 获得 URL -> 将 URL 及元数据写入 PostgreSQL `photos` 表。
2.  **展示流程**：Web 端初始化 -> 请求 PostgreSQL 获取场景配置和照片列表 -> React Three Fiber 根据数据渲染 3D 场景 -> 从 Storage 加载纹理贴图。
