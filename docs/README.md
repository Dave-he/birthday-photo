# 项目文档索引 (Documentation Index)

欢迎阅读 **3D 圣诞生日电子相册** 项目文档。请按照以下顺序阅读以深入了解项目。

## 📚 目录

1.  **[01-overview.md](./01-overview.md)**
    - 项目愿景、核心价值、功能特性概览。
    - 了解我们为什么要开发这个项目以及它能做什么。

2.  **[02-architecture.md](./02-architecture.md)**
    - Monorepo 架构设计。
    - 前后端技术栈选型理由。
    - 系统数据流向图。

3.  **[03-web-client.md](./03-web-client.md)**
    - 前台展示端 (`apps/web`) 深度解析。
    - 3D 场景 (`Scene.tsx`) 实现细节。
    - 各种模式 (Christmas, Birthday...) 的渲染逻辑。

4.  **[04-admin-panel.md](./04-admin-panel.md)**
    - 后台管理端 (`apps/admin`) 功能说明。
    - 基于 Refine 的资源管理 (Photos, Scenes, Members)。
    - 鉴权与安全机制。

5.  **[05-database-schema.md](./05-database-schema.md)**
    - 数据库 E-R 图与表结构详解。
    - RLS (行级安全) 策略。
    - Supabase Storage 配置。

附加：
- 数据库迁移脚本位于 `doc/migrations/`，例如新增设置字段的 `20251213_settings_cycle.sql`。

6.  **[06-deployment.md](./06-deployment.md)**
    - 本地开发环境搭建。
    - Docker 容器化部署指南。
    - 生产环境部署建议 (Vercel/Netlify)。

---

## 快速开始

```bash
# 安装依赖（web / admin / 根工具链）
pnpm install:all

# 启动开发环境（web:3000, admin:5173）
pnpm dev
```
