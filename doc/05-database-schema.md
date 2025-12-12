# 5. 数据库设计 (Database Schema)

本项目使用 PostgreSQL 数据库，托管于 Supabase。

## 5.1 E-R 图概览 (Entity-Relationship)

- **Scenes** (1) ---- (< N) **Photos**
- **Members** (1) ---- (< N) **Photos**
- **Settings** (Singleton)

## 5.2 详细表结构

### 5.2.1 `scenes` (场景表)
定义了照片所属的集合/活动。

| 字段 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default: `gen_random_uuid()` | 唯一标识符 |
| `name` | TEXT | NOT NULL | 场景名称 (e.g. "Christmas 2023") |
| `description` | TEXT | | 场景描述 |
| `created_at` | TIMESTAMPTZ | Default: `now()` | 创建时间 |

### 5.2.2 `members` (成员表)
定义了照片的上传者或关联人物。

| 字段 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default: `gen_random_uuid()` | 唯一标识符 |
| `name` | TEXT | NOT NULL | 成员姓名/昵称 |
| `avatar_url` | TEXT | | 头像图片链接 |
| `created_at` | TIMESTAMPTZ | Default: `now()` | 创建时间 |

### 5.2.3 `photos` (照片表)
核心数据表，存储照片及其元数据。

| 字段 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default: `gen_random_uuid()` | 唯一标识符 |
| `image_url` | TEXT | NOT NULL | 照片文件的完整 URL |
| `title` | TEXT | | 照片标题 |
| `description` | TEXT | | 详细祝福语或描述 |
| `position_index` | INTEGER | | 排序索引 (1-50)，决定挂载位置 |
| `is_featured` | BOOLEAN | Default: `false` | 是否精选 (可用于特殊展示) |
| `scene_id` | UUID | FK -> `scenes.id` | 所属场景 |
| `member_id` | UUID | FK -> `members.id` | 所属成员 |
| `tags` | TEXT[] | | 标签数组 (e.g. ["funny", "memories"]) |
| `created_at` | TIMESTAMPTZ | Default: `now()` | 创建时间 |

### 5.2.4 `settings` (设置表)
存储全局配置。通常只包含一行记录。

| 字段 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | 唯一标识符 |
| `bg_music_url` | TEXT | | 背景音乐 URL |
| `is_snowing` | BOOLEAN | Default: `true` | 是否开启下雪特效 |
| `snow_density` | INTEGER | Default: `100` | 雪花密度 |
| `greeting_title` | TEXT | | 首页欢迎语 |
| `auto_mode_cycle_enabled` | BOOLEAN | Default: `true` | 是否启用自动模式轮播 |
| `mode_cycle_min_seconds` | INTEGER | Default: `60` | 模式轮播最小间隔 (秒) |
| `mode_cycle_max_seconds` | INTEGER | Default: `180` | 模式轮播最大间隔 (秒) |
| `low_quality_mode` | BOOLEAN | Default: `false` | 低画质模式（降低粒子与渲染负载） |
| `particle_multiplier` | NUMERIC | Default: `1` | 粒子数量倍率 (0.1–2) |
| `rotate_speed` | NUMERIC | | 自动旋转速度（HUD 旋转速度） |

## 5.3 安全策略 (RLS Policies)

为了保证数据安全，所有表都启用了 Row Level Security (RLS)。

- **SELECT (读取)**:
  - `public` 角色 (匿名用户) 允许读取所有表 (`true`)。这确保 Web 端可以无需登录加载照片。
- **INSERT/UPDATE/DELETE (写入)**:
  - 仅允许 `authenticated` 角色 (登录后的管理员) 执行。
  - 策略示例: `auth.role() = 'authenticated'`。

## 5.4 Storage Buckets
Supabase Storage 中需要创建以下 Buckets:
- `photos`: 存储相册照片，Public Access = True。
- `avatars`: 存储成员头像，Public Access = True。
