# Birthday Photo - 3D 电子相册项目操作手册与部署文档 🎄🎂💖🎉

欢迎使用 **Birthday Photo - 3D 电子相册项目**！本项目采用 Next.js 16 (Turbopack) 结合 React Three Fiber + Drei 作为 3D 渲染端，后台管理系统采用 Refine + Ant Design + Vite 构建，并由本地 Docker 部署的 Supabase (PostgreSQL + Storage) 提供全套后端及多媒体存储服务。

本指南提供了**详尽的操作手册**与**端到端部署流程**，帮助您快速玩转 3D 梦幻相册！

---

## 目 录
1. [📖 用户操作手册 (User Guide)](#1-用户操作手册-user-guide)
   - [1.1 3D 展示前端交互](#11-3d-展示前端交互)
   - [1.2 管理后台日常维护](#12-管理后台日常维护)
2. [⚙️ 系统部署文档 (Deployment Guide)](#2-系统部署文档-deployment-guide)
   - [2.1 本地开发与环境联调](#21-本地开发与环境联调)
   - [2.2 数据库迁移与初始化](#22-数据库迁移与初始化)
   - [2.3 生产环境 Docker 容器化打包](#23-生产环境-docker-容器化打包)
3. [🧪 端到端 (E2E) 测试运行](#3-端到端-e2e-测试运行)
4. [📄 许可证协议 (License)](#4-许可证协议-license)

---

## 1. 📖 用户操作手册 (User Guide)

### 1.1 3D 展示前端交互

用户在浏览器打开展示端前端后，系统将加载一个精美的首屏欢迎遮罩，点击 **ENTER EXPERIENCE** 按钮将正式开启 3D 奢华相册旅程。

#### 360° 全景观察与漫游
*   **视角旋转**：在 3D 场景中按下鼠标左键并拖拽，即可围绕中心点进行 360° 全景旋转观察。
*   **缩放视角**：滑动鼠标滚轮或在触摸板上进行双指缩放，即可拉近 (Zoom in) 或拉远 (Zoom out) 摄像机镜头。
*   **查看照片详情**：鼠标悬停在相册装饰球或相框上时，照片将小幅放大，且上方会浮现照片标题。**点击**相框会呼出玻璃拟态毛玻璃详情卡片，显示大图、祝福寄语、上传人头像姓名和标签。

#### 底部 HUD 智能控制面板
*   **场景模式切换**：点击对应图标一键改变主题氛围：
    *   🎄 **圣诞模式**: 绿意盎然的圣诞树挂载着照片装饰球，空中飘落洁白雪花。
    *   🎂 **生日模式**: 三层生日蛋糕摇曳着烛光，五彩缤纷的气球在空中缓缓上升。
    *   💖 **浪漫模式**: 粉色浪漫粒子光晕漫天飞舞，洋溢粉色柔情。
    *   🎉 **派对模式**: 动态高空烟花粒子特效，气球与炫光交相辉映。
*   **照片布局选择**：
    *   `Tree`: 照片作为装饰球挂在圣诞树上。
    *   `Helix`: 照片以优雅的双螺旋上升结构排列。
    *   `Sphere`: 所有相框环绕成一个庞大的水晶科技球体。
    *   `Grid`: 传统的网格画廊，面向用户排布，并带有微幅波浪漂浮感。
*   **音乐控制 (🎵/🔇)**：点击喇叭图标，可以自由播放或静音管理员配置的背景音乐。
*   **参数微调面板 (⚙️)**：点击齿轮可展开性能与视觉微调：
    *   `Quality Preset`: 支持 Auto/Low/High 切换。Low 模式会自动关闭 bloom 等后期特效，并将 DPR 锁定为 1，确保低端设备流畅。
    *   `Particles`: 粒子数量滑块（0.1x - 2.0x 调节）。
    *   `Rotation Speed`: 摄像机自动旋转速度调节。

---

### 1.2 管理后台日常维护

管理员通过 Refine 认证登录进入后台管理系统 (`http://localhost:8080`)，可完成全套资源的日常维护。

1.  **Dashboard (数据看板)**：
    *   直观查看当前系统的照片总数、场景总数和成员总数，查看最近上传的照片和系统连接状态。
2.  **Scenes (场景管理)**：
    *   创建新的相册聚会场景（例如 "毕业季 2024"、"蜜月旅行"）。
3.  **Members (成员管理)**：
    *   添加参与本相册上传互动的家庭成员或朋友，上传其精美头像。
4.  **Photos (照片管理)**：
    *   点击 **Create Photo** 批量或单张上传精美照片至 Supabase Storage。
    *   关联所属的场景、所属的成员，添加标题、祝福寄语，以及照片显示的 3D 索引位置。
5.  **Settings (全局配置维护)**：
    *   可随时更改背景音乐 URL、下雪开关、欢迎语，以及设置自动循环模式的时间间隔等参数。

---

## 2. ⚙️ 系统部署文档 (Deployment Guide)

### 2.1 本地开发与环境联调

项目支持连接本地 Docker 部署的 Supabase（Kong 代理运行于 `8000` 端口，PostgreSQL 数据库映射于 `15433` 端口）。

#### 第一步：建立本地配置文件
在项目对应目录中创建配置文件，填入您的 Host IP (`192.168.0.196` 或您的本地 IP)：

*   **项目根目录 `.env`** & **前端展示端 `apps/web/.env.local`**：
    ```env
    NEXT_PUBLIC_SUPABASE_URL=http://192.168.0.196:8000
    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY1NzI4MDAwLCJleHAiOjE5MjM0OTQ0MDB9.TvUdo_Zg_svi6SwUiwJtqKatjkbqEw_pCZznEkHDR
    ```

*   **后台管理端 `apps/admin/.env`**：
    ```env
    VITE_SUPABASE_URL=http://192.168.0.196:8000
    VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY1NzI4MDAwLCJleHAiOjE5MjM0OTQ0MDB9.TvUdo_Zg_svi6SwUiwJtqKatjkbqEw_pCZznEkHDR
    VITE_WEB_URL=http://localhost:3000
    ```

#### 第二步：一键运行服务
进入根目录，使用 pnpm 一键启动开发环境：
```bash
pnpm install
pnpm dev
```
启动成功后，即可通过以下链接访问系统：
*   **前端 3D 相册前端**: `http://localhost:3000`
*   **后台管理系统**: `http://localhost:8080`

---

### 2.2 数据库迁移与初始化

若您的本地 Supabase 容器数据库为空，请按照以下步骤初始化表结构和样本照片数据：

1.  打开本地 Supabase 控制台（通常为 `http://192.168.0.196:54323`）。
2.  导航至 **SQL Editor** 选项，新建查询。
3.  依次复制并执行以下文件中的 SQL 脚本：
    *   `database/schema.sql` (创建 scenes, members, photos, settings 数据表结构)。
    *   `database/policy.sql` (启用并配置 RLS 安全策略，保障匿名用户仅可 SELECT 读取，认证管理员才可写入)。
    *   `database/test_data.sql` (注入初始配置参数、示例成员和 3D 精美测试照片)。
4.  导航至 **Storage** 选项，新建一个名为 **`photos`** 的 **Public Bucket**，将其 Public Access 权限开启为 True，确保照片能生成合法的 CORS 公网链接。

---

### 2.3 生产环境 Docker 容器化打包

项目已完全适配多阶段生产 Docker 容器化打包编译。您可以在本地一键编排并拉起生产服务：

```bash
# 本地拉起生产多阶段编译容器
docker-compose up --build -d
```
Docker 将自动按照 monorepo 分块：
*   `apps/web`: 采用 Next.js Standalone 模式进行高压缩编译，运行于宿主机 `3000` 端口。
*   `apps/admin`: 基于 TypeScript 编译生成极致静态资源，通过内置 Nginx 高效反向代理挂载，运行于宿主机 `8080` 端口。

---

## 3. 🧪 端到端 (E2E) 测试运行

系统已内置了 API 通道验证与 Playwright 浏览器模拟自动化 E2E 测试：

### 1. 运行 API & 数据库连接性 E2E 测试
在根目录下执行（检测 15433 和 8000 端口通信及 SQL 读取）：
```bash
NODE_PATH=apps/web/node_modules node tests/api-e2e.js
```

### 2. 运行 Playwright 浏览器自动化测试
测试会模拟 Chromium, Firefox, Webkit 浏览器自动启动 Next.js 页面，点击 ENTER EXPERIENCE 并验证 WebGL 3D 渲染：
```bash
# 安装浏览器环境 (仅首次运行需要)
npx playwright install

# 执行端到端浏览器自动化跑测
npx playwright test
```

---

## 4. 📄 许可证协议 (License)

本项目基于 **[MIT License](./LICENSE)** 协议开源。

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
