# 生日/节日 3D 电子相册 - 项目文档

## 1. 项目概览

本项目是一个基于 Web 的 3D 互动电子相册，专为生日、圣诞、派对和浪漫场合设计。它不仅仅是一个照片展示工具，更是一个沉浸式的礼物体验。用户可以在 3D 场景中旋转视角，探索悬挂在圣诞树或排列在螺旋结构中的照片，点击照片查看详细祝福。

### 核心特性

- **多场景模式**：支持圣诞 (Christmas)、生日 (Birthday)、浪漫 (Romantic)、派对 (Party) 四种主题模式，自动或手动切换。
- **多样的 3D 布局**：照片展示支持树形 (Tree)、螺旋 (Helix)、球形 (Sphere)、网格 (Grid) 等多种空间布局。
- **沉浸式体验**：
  - 3D 场景漫游（旋转、缩放）。
  - 背景音乐播放与控制。
  - 动态天气/环境效果（下雪、气球、烟花、云朵）。
  - 后期处理特效（Bloom 泛光、Vignette 暗角）。
- **后台管理系统**：提供完整的后台管理界面，用于管理照片、场景、成员和全局设置。

## 2. 技术架构

项目采用 Monorepo 架构，统一管理前台展示端和后台管理端。

### 2.1 目录结构

```text
root/
├── apps/
│   ├── admin/       # 后台管理端 (Vite + React + Refine)
│   └── web/         # 前台展示端 (Next.js + React Three Fiber)
├── doc/             # 项目文档与数据库 SQL
├── docker-compose.yml # Docker 编排文件
├── pnpm-workspace.yaml # Monorepo 工作区配置
└── package.json     # 根依赖配置
```

### 2.2 技术栈

**前台展示端 (apps/web)**
- **框架**: [Next.js 14+](https://nextjs.org/) (App Router)
- **3D 引擎**: [React Three Fiber (R3F)](https://docs.pmnd.rs/react-three-fiber) / Three.js
- **UI 组件**: React Three Drei (3D 辅助库), Framer Motion (2D 动画)
- **样式**: Tailwind CSS
- **状态管理**: React Hooks (useState, useEffect, useContext)

**后台管理端 (apps/admin)**
- **框架**: [Refine](https://refine.dev/) (基于 React 的无头企业级框架)
- **构建工具**: [Vite](https://vitejs.dev/)
- **数据交互**: Supabase Data Provider

**后端与存储**
- **BaaS**: [Supabase](https://supabase.com/)
- **数据库**: PostgreSQL
- **对象存储**: Supabase Storage (存储照片文件)

## 3. 详细实现说明

### 3.1 Web 端核心组件 (`apps/web/components`)

Web 端是用户体验的核心，采用模块化架构，由 `Scene.tsx` 统筹整个 3D 场景。

#### `Scene.tsx` (场景协调器)
- **职责**：作为主入口，负责协调状态、数据获取和子组件组合，不再包含具体的渲染逻辑。
- **核心逻辑**：
  - **数据获取**：挂载时从 Supabase 获取场景 (`scenes`) 和全局设置 (`settings`)。
  - **模式管理**：使用自定义 Hook `useAutoMode` 管理模式 (`mode`) 和布局 (`layout`) 的自动轮播逻辑。
  - **性能管理**：使用 `PerformanceMonitor` 实时监控帧率，自动降级画质（如禁用 Bloom）或升级画质。集成 `AdaptiveDpr` 和 `AdaptiveEvents` 以在操作时动态调整分辨率和事件频率。
  - **组件组合**：将环境、特效、内容和 HUD 组合在一起。

#### 模块化子组件
为了提高可维护性和性能，场景逻辑被拆分为以下子模块：

1.  **`SceneEnvironment.tsx`**：管理环境光、雾效 (`Fog`)、背景色和星空 (`Stars`)。支持基于模式 (`Christmas`, `Birthday` 等) 的动态色彩主题切换。
2.  **`SceneEffects.tsx`**：集中管理视觉特效，如雪花 (`Sparkles`)、气球 (`Balloons`)、烟花 (`Fireworks`) 和云层 (`Cloud`)，根据当前模式按需加载。支持根据性能设置动态调整粒子数量。
3.  **`SceneContent.tsx`**：包含核心 3D 实体（圣诞树、蛋糕、礼物、画廊），集成物理引擎 (`@react-three/cannon`) 处理物体交互。
4.  **`SceneHUD.tsx`**：2D 界面层，提供场景选择、模式切换、音乐控制以及详细的**性能设置面板**（可调整画质、粒子倍率、旋转速度、自适应开关）。

#### `PhotoGallery.tsx` (照片画廊)
- **职责**：负责将照片数据渲染为 3D 空间中的对象。
- **布局算法**：根据传入的 `layout` 参数 ('tree', 'helix', 'grid', 'sphere') 计算每张照片在 3D 空间中的 `(x, y, z)` 坐标和旋转角度。
- **性能优化**：使用 `useTexture` 预加载纹理，动态调整几何体精度。

#### `Ornament.tsx` (装饰物/照片载体)
- **职责**：渲染单个照片对象（球形或卡片状）。
- **优化**：使用 `useTexture` 替代 `TextureLoader` 以支持 Suspense 和缓存；根据悬停状态动态调整光照和材质质量。

#### 其他组件
- **`Overlay.tsx`**：2D 加载遮罩，提供开场动画。
- **`MagicParticles.tsx`**：基于 `InstancedMesh` 的高性能粒子系统。

### 3.2 Admin 端功能 (`apps/admin`)

Admin 端基于 Refine 框架快速构建，提供了标准的 CRUD (增删改查) 功能。

- **Photos**: 上传照片，设置标题、祝福语、排序索引 (`position_index`)，关联场景和成员。
- **Scenes**: 创建不同的场景（如“2023圣诞”、“小明生日”），用于分组管理照片。
- **Members**: 管理贡献照片的成员信息（头像、昵称）。
- **Settings**: 全局配置，如背景音乐 URL、是否下雪、欢迎语标题等。

### 3.3 数据库设计

数据库 Schema 定义在 `doc/` 目录下的 `.sql` 文件中。主要包含以下表：

- `scenes`: 场景表 (id, name, description...)
- `members`: 成员表 (id, name, avatar_url...)
- `photos`: 照片表 (id, image_url, title, description, scene_id, member_id, position_index...)
- `settings`: 全局设置表 (id, bg_music_url, is_snowing, greeting_title...)

## 4. 部署与运行指南

### 4.1 前置要求
- Node.js 18+
- pnpm
- Docker & Docker Compose (可选，用于容器化部署)
- Supabase 项目 (包含 URL 和 Anon Key)

### 4.2 环境变量配置

在根目录下创建 `.env` 文件（参考 `.env.example`），填入以下内容：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4.3 本地开发启动

1.  **安装依赖**：
    ```bash
    pnpm install
    ```

2.  **启动 Web 端 (前台)**：
    ```bash
    pnpm --filter web dev
    # 访问 http://localhost:3000
    ```

3.  **启动 Admin 端 (后台)**：
    ```bash
    pnpm --filter admin dev
    # 访问 http://localhost:5173 (或终端显示的端口)
    ```

### 4.4 Docker 部署

项目包含 `docker-compose.yml`，可一键启动所有服务。

1.  **构建并启动**：
    ```bash
    docker-compose up -d --build
    ```

2.  **访问服务**：
    - Web 端: `http://localhost:3000`
    - Admin 端: `http://localhost:8080`

## 5. 下一步修改与优化建议

基于当前实现，以下是推荐的后续改进方向：

### 5.1 代码与配置优化
-   **硬编码配置抽离**：目前 `Scene.tsx` 中的场景切换时间间隔、默认布局顺序等逻辑是硬编码的。建议将其移至数据库的 `settings` 表中，允许管理员在后台动态调整。
-   **类型定义完善**：利用 Supabase CLI 自动生成 TypeScript 类型定义 (`database.types.ts`)，替换手写的类型，确保与数据库 Schema 严格同步。

### 5.2 功能增强
-   **移动端适配优化**：3D 场景在手机浏览器上的性能和交互（触摸旋转灵敏度）需要进一步调优。考虑添加“低画质模式”开关。
-   **更多互动元素**：
    -   允许用户在 Web 端发送简单的弹幕或点赞，实时显示在 3D 场景中。
    -   增加“许愿卡”功能，挂在树上。
-   **资源预加载**：实现更精细的资源预加载策略 (Loading Manager)，避免场景切换时的卡顿。

### 5.3 部署与运维
-   **CI/CD 流水线**：配置 GitHub Actions 自动构建和部署到 Vercel (Web) 和静态托管服务 (Admin)。
-   **CDN 加速**：确保 Supabase Storage 的图片资源通过 CDN 分发，提高加载速度。
