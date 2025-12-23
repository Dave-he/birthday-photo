# 3D 圣诞生日电子相册 - 设计与实施方案 (Monorepo Edition)

## 1. 项目愿景 (Product Vision)
打造一款温暖、梦幻且易于管理的3D电子相册。它不仅仅是一个照片展示工具，更是一份充满心意的数字化礼物。通过3D互动的圣诞树形式，将珍贵的回忆悬挂其中，用户可以在指尖旋转、探索，感受每一张照片背后的故事。

**适用人群**：希望为亲朋好友（特别是生日在圣诞/冬季期间）制作独特纪念礼物的大众用户。
**核心价值**：情感连接、沉浸式体验、长期保存。

---

## 2. 艺术指导方案 (Art Direction) - By 美术艺术家

### 2.1 视觉风格 (Visual Style)
*   **主题**：**"Cozy Winter Night" (温馨冬夜)**
*   **色板**：
    *   背景：深午夜蓝 (#0f172a) 到 黑色 的径向渐变，模拟深夜星空。
    *   主色调：圣诞绿 (树叶), 暖金 (#ffd700, 灯光/星星), 节日红 (#ef4444, 装饰球/丝带)。
    *   点缀：雪白色 (雪花粒子)。
*   **光影氛围**：
    *   全局环境光较暗，突出树上的串灯和装饰物的自发光。
    *   照片装饰球带有轻微的玻璃质感和反射。
    *   树顶星星作为主光源之一，散发柔和的光晕。

### 2.2 交互体验 (UX/Interaction)
*   **初次加载**：
    *   Loading 画面：一个跳动的礼物盒或旋转的雪花。
    *   进入场景：相机从远处平滑推近至圣诞树，伴随轻柔的背景音乐渐入。
*   **核心互动**：
    *   **旋转**：用户可拖拽屏幕 360度 旋转查看圣诞树。
    *   **探索**：照片以“拍立得”或“水晶球”形态挂在树梢。
    *   **点击**：点击某张照片，相机聚焦该照片，背景虚化，弹出高清大图和文字祝福（模态框）。
    *   **彩蛋**：点击树顶星星，触发满屏烟花或流星雨特效。
*   **UI 界面**：
    *   采用 **Glassmorphism (毛玻璃)** 风格，悬浮于3D场景之上。
    *   极简设计，只保留必要的控制按钮（音乐开关、全屏、分享）。

---

## 3. 技术架构方案 (Technical Architecture) - By 前端架构师

### 3.1 Monorepo 架构 (pnpm)
项目采用 Monorepo 结构，统一管理后台管理端和前台展示端。

```
root/
├── apps/
│   ├── admin/       # Refine + Vite (后台管理)
│   └── web/         # Next.js + Three.js (3D 展示)
├── packages/        # (可选) 共享配置或 UI 库
├── pnpm-workspace.yaml
└── package.json
```

### 3.2 技术栈选型 (Tech Stack)

#### Apps: Admin (后台管理)
*   **框架**: [Refine](https://refine.dev/) (Headless Framework)
*   **构建工具**: [Vite](https://vitejs.dev/)
*   **UI 库**: Material UI 或 Ant Design (Refine 内置支持较好)
*   **功能**: 照片上传、元数据编辑 (祝福语、排序)、全局设置。

#### Apps: Web (3D 展示)
*   **框架**: [Next.js 14+ (App Router)](https://nextjs.org/)
*   **3D 引擎**: [Three.js](https://threejs.org/) + [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
*   **动画**: Framer Motion
*   **状态管理**: Zustand

#### Backend (BaaS)
*   **服务**: [Supabase](https://supabase.com/)
*   **Database**: PostgreSQL (存储照片信息)
*   **Storage**: Object Storage (存储照片原文件)

### 3.3 系统架构图

```mermaid
graph TD
    User[用户] --> |浏览| Web[Apps: Web (Next.js)]
    Admin[管理员] --> |管理| AdminApp[Apps: Admin (Refine+Vite)]
    
    subgraph Frontend_Monorepo
        Web --> |渲染| ThreeScene[3D Scene]
        AdminApp --> |CRUD| Dashboard[Dashboard UI]
    end
    
    subgraph Backend_Supabase
        AdminApp --> |API| DB[(PostgreSQL)]
        AdminApp --> |Upload| Storage[Object Storage]
        Web --> |Fetch| DB
        Web --> |Load Assets| Storage
    end
```

### 3.4 数据模型设计 (Schema)

**Table: `photos`**

| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | uuid | 主键 |
| `image_url` | text | 图片 URL |
| `title` | text | 标题 |
| `description` | text | 祝福语 |
| `position_index`| int | 挂载位置 (1-50) |
| `is_featured` | boolean| 是否精选 |
| `created_at` | timestamp| 创建时间 |

---

## 4. 详细实施流程 (Implementation Plan)

### 阶段一：Monorepo 初始化
1.  配置 `pnpm-workspace.yaml`。
2.  初始化 `apps/admin` (Refine + Vite)。
3.  初始化 `apps/web` (Next.js)。

### 阶段二：后台功能开发 (Admin)
1.  配置 Supabase Data Provider。
2.  实现 `photos` 列表页、编辑页、创建页。
3.  集成图片上传控件，直接上传至 Supabase Storage。

### 阶段三：3D 场景开发 (Web)
1.  搭建 R3F 场景 (Canvas, Lights, Stars)。
2.  实现圣诞树模型 (Tree Component)。
3.  开发装饰球组件 (Ornament)，映射 `photos` 数据。
4.  实现交互逻辑 (点击、旋转、弹窗)。

### 阶段四：整合与优化
1.  联调数据：确保后台上传的照片能实时显示在 3D 树上。
2.  UI 美化：应用毛玻璃效果，添加背景音乐。
3.  部署上线。
