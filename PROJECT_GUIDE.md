# Birthday Photo - 3D 电子相册项目

## 项目概述

这是一个基于 Next.js + React Three Fiber 的 3D 电子相册项目,包含管理后台和前端展示两个应用。项目采用 Monorepo 架构,使用 Supabase 作为后端服务。

## 技术栈

### 前端展示端 (apps/web)
- **框架**: Next.js 14+ (App Router)
- **3D 引擎**: React Three Fiber + React Three Drei
- **动画**: Framer Motion + React Spring
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **后端**: Supabase (PostgreSQL + Storage)

### 后台管理端 (apps/admin)
- **框架**: Refine + React
- **构建工具**: Vite
- **UI 库**: Ant Design
- **数据层**: Refine Supabase Data Provider
- **认证**: Supabase Auth

## 项目结构

```
birthday-photo/
├── apps/
│   ├── admin/          # 后台管理系统
│   │   ├── src/
│   │   │   ├── pages/  # 资源管理页面
│   │   │   │   ├── dashboard/    # 仪表盘
│   │   │   │   ├── photos/       # 照片管理
│   │   │   │   ├── scenes/       # 场景管理
│   │   │   │   ├── members/      # 成员管理
│   │   │   │   └── settings/     # 全局设置
│   │   │   ├── App.tsx
│   │   │   └── authProvider.ts
│   │   └── package.json
│   │
│   └── web/            # 前端 3D 展示
│       ├── app/        # Next.js App Router
│       ├── components/ # 3D 组件
│       │   ├── Scene.tsx           # 主场景控制器
│       │   ├── PhotoGallery.tsx    # 照片画廊
│       │   ├── SceneContent.tsx    # 场景内容
│       │   ├── SceneEffects.tsx    # 特效系统
│       │   ├── SceneEnvironment.tsx # 环境设置
│       │   ├── SceneHUD.tsx        # 用户界面
│       │   ├── Ornament.tsx        # 照片装饰球
│       │   ├── Tree.tsx            # 圣诞树
│       │   ├── Cake.tsx            # 生日蛋糕
│       │   ├── Balloons.tsx        # 气球
│       │   ├── Fireworks.tsx       # 烟花
│       │   └── ...
│       ├── hooks/      # 自定义 Hooks
│       ├── lib/        # 工具库
│       └── types/      # TypeScript 类型定义
│
├── database/           # 数据库脚本
│   ├── schema.sql      # 表结构定义
│   ├── policy.sql      # 行级安全策略
│   └── test_data.sql   # 测试数据
│
└── docs/              # 项目文档
```

## 核心功能

### 前端展示 (Web)

#### 1. 多场景模式
- 🎄 **Christmas (圣诞模式)**: 圣诞树 + 飘雪效果
- 🎂 **Birthday (生日模式)**: 蛋糕 + 漂浮气球
- 💖 **Romantic (浪漫模式)**: 粉色粒子 + 爱心元素
- 🎉 **Party (派对模式)**: 烟花特效

#### 2. 多种布局方式
- **Tree (树形)**: 照片挂在圣诞树上
- **Helix (螺旋)**: 螺旋上升排列
- **Sphere (球形)**: 分布在球体表面
- **Grid (网格)**: 平面网格排列

#### 3. 交互功能
- 360° 旋转观察场景
- 点击照片查看详情
- 自动模式轮播
- 背景音乐播放
- 性能预设切换 (Auto/Low/High)

#### 4. 性能优化
- 自适应 DPR (设备像素比)
- 粒子数量动态调整
- 低画质模式
- 后期处理自适应
- PerformanceMonitor 自动降级

### 后台管理 (Admin)

#### 1. Dashboard (仪表盘)
- 统计数据展示 (照片/场景/成员数量)
- 最近上传的照片列表
- 快速操作入口
- 系统状态监控

#### 2. Photos (照片管理)
- 批量上传照片
- 关联场景和成员
- 添加标签和描述
- 设置位置索引
- 标记精选照片
- 预览 3D 场景

#### 3. Scenes (场景管理)
- 创建/编辑场景
- 场景描述
- 场景列表

#### 4. Members (成员管理)
- 添加成员信息
- 上传头像
- 成员列表

#### 5. Settings (全局设置)
- 背景音乐上传
- 欢迎语设置
- 下雪效果开关
- 自动模式轮播配置
- 性能参数调整
- 快速预设 (Mobile/Desktop/Cinematic)

## 数据库设计

### 表结构

#### scenes (场景表)
```sql
- id: UUID (主键)
- name: TEXT (场景名称)
- description: TEXT (描述)
- created_at: TIMESTAMPTZ
```

#### members (成员表)
```sql
- id: UUID (主键)
- name: TEXT (成员姓名)
- avatar_url: TEXT (头像链接)
- created_at: TIMESTAMPTZ
```

#### photos (照片表)
```sql
- id: UUID (主键)
- image_url: TEXT (照片 URL)
- title: TEXT (标题)
- description: TEXT (描述)
- position_index: INTEGER (位置索引)
- is_featured: BOOLEAN (是否精选)
- scene_id: UUID (外键 -> scenes)
- member_id: UUID (外键 -> members)
- tags: TEXT[] (标签数组)
- created_at: TIMESTAMPTZ
```

#### settings (设置表)
```sql
- id: UUID (主键)
- bg_music_url: TEXT (背景音乐)
- is_snowing: BOOLEAN (是否下雪)
- snow_density: INTEGER (雪花密度)
- greeting_title: TEXT (欢迎语)
- auto_mode_cycle_enabled: BOOLEAN (自动轮播)
- mode_cycle_min_seconds: INTEGER (最小间隔)
- mode_cycle_max_seconds: INTEGER (最大间隔)
- low_quality_mode: BOOLEAN (低画质模式)
- particle_multiplier: NUMERIC (粒子倍率)
- rotate_speed: NUMERIC (旋转速度)
```

### 安全策略 (RLS)

- **SELECT**: 所有表对公众开放读取
- **INSERT/UPDATE/DELETE**: 仅认证用户可执行

## 环境配置

### 1. 创建 Supabase 项目

访问 [Supabase](https://supabase.com) 创建新项目

### 2. 执行数据库脚本

按顺序执行以下 SQL 文件:
```bash
1. database/schema.sql      # 创建表结构
2. database/policy.sql      # 设置安全策略
3. database/test_data.sql   # 插入测试数据
```

### 3. 创建 Storage Bucket

在 Supabase Dashboard 中创建:
- Bucket 名称: `photos`
- Public Access: `true`
- 允许的文件类型: `image/jpeg, image/png, image/gif, image/webp`

### 4. 配置环境变量

#### 根目录 `.env`
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Admin 端 `apps/admin/.env`
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_WEB_URL=http://localhost:3001
```

#### Web 端 `apps/web/.env.local`
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. 更新 Supabase 配置

修改以下文件中的 Supabase 配置:

**apps/admin/src/utility/supabaseClient.ts**
```typescript
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";
```

**apps/web/lib/supabaseClient.ts**
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
```

## 本地开发

### 1. 安装依赖
```bash
pnpm install
```

### 2. 启动开发服务器

#### 启动所有应用
```bash
pnpm dev
```

#### 仅启动 Web 端
```bash
cd apps/web
pnpm dev
# 访问 http://localhost:3001
```

#### 仅启动 Admin 端
```bash
cd apps/admin
pnpm dev
# 访问 http://localhost:5173
```

## 生产部署

### Web 端部署 (Vercel 推荐)

1. 连接 GitHub 仓库到 Vercel
2. 设置根目录为 `apps/web`
3. 配置环境变量
4. 部署

### Admin 端部署

#### 构建静态文件
```bash
cd apps/admin
pnpm build
```

#### 部署到静态托管服务
- Vercel
- Netlify
- AWS S3 + CloudFront

## 使用指南

### 管理员操作流程

1. **登录后台**: 访问 Admin 端,使用 Supabase Auth 登录
2. **创建场景**: 在 Scenes 页面创建新场景 (如 "Christmas 2024")
3. **添加成员**: 在 Members 页面添加成员信息
4. **上传照片**: 在 Photos 页面批量上传照片,关联场景和成员
5. **配置设置**: 在 Settings 页面设置背景音乐、欢迎语等
6. **预览效果**: 点击照片列表中的预览按钮查看 3D 效果

### 用户访问流程

1. 访问 Web 端 URL
2. 点击 "Start" 按钮进入场景
3. 拖拽旋转观察场景
4. 点击照片查看详情
5. 使用 HUD 切换场景、模式、布局
6. 调整性能设置以获得最佳体验

## 性能优化建议

### 移动端
- 使用 Low Quality 预设
- 粒子倍率设置为 0.5
- 旋转速度设置为 0.5
- 禁用部分后期特效

### 桌面端
- 使用 Auto 或 High Quality 预设
- 粒子倍率设置为 1.0-1.5
- 旋转速度设置为 0.8-1.2
- 启用完整后期特效

### 大屏展示
- 使用 Cinematic 预设
- 粒子倍率设置为 1.5-2.0
- 旋转速度设置为 1.2
- 最大化后期特效

## 常见问题

### 1. 照片无法显示
- 检查 Supabase Storage Bucket 是否设置为 Public
- 确认照片 URL 可访问
- 检查浏览器控制台是否有 CORS 错误

### 2. 性能卡顿
- 降低粒子倍率
- 启用低画质模式
- 减少照片数量
- 压缩照片文件大小

### 3. 音乐无法播放
- 确认浏览器允许自动播放
- 检查音乐文件 URL 是否有效
- 尝试点击页面后再播放

### 4. 登录失败
- 检查 Supabase Auth 配置
- 确认环境变量正确
- 查看浏览器控制台错误信息

## 后续开发建议

### 功能增强
- [ ] 添加更多 3D 模型和装饰元素
- [ ] 支持视频内容
- [ ] 添加评论和点赞功能
- [ ] 支持多语言
- [ ] 添加分享功能

### 性能优化
- [ ] 实现图片懒加载
- [ ] 使用 CDN 加速资源
- [ ] 优化 3D 模型文件大小
- [ ] 实现渐进式加载

### 用户体验
- [ ] 添加引导教程
- [ ] 优化移动端触控体验
- [ ] 添加键盘快捷键
- [ ] 支持 VR 模式

## 技术支持

如有问题,请查看:
- [项目文档](./docs/)
- [Supabase 文档](https://supabase.com/docs)
- [React Three Fiber 文档](https://docs.pmnd.rs/react-three-fiber)
- [Refine 文档](https://refine.dev/docs)

## 许可证

MIT License

---

**祝您使用愉快!** 🎄🎂💖🎉
