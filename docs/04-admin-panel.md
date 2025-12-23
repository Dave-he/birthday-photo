# 4. 后台管理端详解 (Admin Panel)

位于 `apps/admin` 目录，为管理员提供内容管理功能。

## 4.1 框架与工具
- **Refine**: 核心框架。它通过 `resources` 概念抽象了 CRUD 操作。
- **Vite**: 负责开发环境的热更新和生产环境构建。
- **Supabase Data Provider**: Refine 的插件，负责将前端的操作（如 `create`, `update`）转换为 Supabase Client 的 API 调用。

## 4.2 资源模块 (Resources)

### 4.2.1 Photos (照片管理)
- **列表页 (`list.tsx`)**:
  - 以表格形式展示所有照片。
  - 支持按 Scene 筛选。
  - 显示缩略图、标题、关联成员。
- **创建/编辑页 (`create.tsx`, `edit.tsx`)**:
  - **图片上传**: 集成文件上传组件，直接上传至 Supabase Storage bucket (`photos`)，获取 URL 后存入数据库。
  - **元数据录入**: 填写 Title, Description, Position Index。
  - **关联选择**: 下拉选择所属 Scene 和 Member。

### 4.2.2 Scenes (场景管理)
- 用于创建和管理不同的活动场景（例如“2023公司年会”、“宝宝一岁生日”）。
- 字段：Name, Description, Created At。

### 4.2.3 Members (成员管理)
- 管理照片的贡献者或相关人员。
- 字段：Name, Avatar (头像上传)。

### 4.2.4 Settings (全局设置)
- 一个特殊的单例资源，通常只允许编辑。
- **字段**:
  - `bg_music_url`: 背景音乐的 MP3/URL 地址。
  - `is_snowing`: 开关，控制 Web 端是否下雪。
  - `greeting_title`: Web 端首页显示的欢迎标题。
  - `auto_mode_cycle_enabled` / `mode_cycle_min_seconds` / `mode_cycle_max_seconds`: 自动场景轮播开关与时间区间。
  - `low_quality_mode` / `particle_multiplier` / `rotate_speed`: 性能与体验参数，控制粒子密度与自动旋转速度。

#### 预设按钮
在设置编辑页提供 Mobile / Desktop / Cinematic 预设按钮，快速填充推荐参数，便于不同设备与场景快速部署。

## 4.3 鉴权与安全 (Auth & Security)
- **登录**: 使用 Supabase Auth (Email/Password)。
- **路由保护**: Refine 内置 `Authenticated` 组件，未登录用户会被重定向至登录页。
- **RLS (Row Level Security)**: 即使前端代码泄露，数据库层面的 RLS 策略也能确保只有经过身份验证的 Admin 才能执行写操作（INSERT/UPDATE/DELETE）。
