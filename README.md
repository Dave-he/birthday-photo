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
   - 注入 **ZCOOL Chinese 艺术字体** 支持，完美呈现中文场景名和欢迎语，拒绝中文字符方块乱码。
   - 包含动态彩色点光源（在场景上空缓慢运动和呼吸），令金属表面的相框、水晶玻璃材质的圣诞树产生奢华反光。
3. **真实相册渲染与 CORS 防崩溃兜底**：
   - 采用异步 Texture 缓存加载机制，在网络延迟、404 或 CORS 跨域错误时自动降级到精美占位图，确保 3D 画布 100% 坚韧不崩溃。
4. **本地 Docker Supabase 开箱即用**：
   - 项目提供一键连接本地 Docker 部署的 Supabase 环境配置文件，实现极速本地私有化数据存储。
5. **企业级 CI/CD 流水线**：
   - 配置好完整的 GitHub Actions 打包流水线，自动检测多端编译兼容性。

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
│   └── test_data.sql
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
2. 进入 SQL Editor，依次运行 `database/schema.sql`、`database/policy.sql` 和 `database/test_data.sql`。
3. 进入 Storage 菜单，新建一个名为 `photos` 的 **Public Bucket**。

### 3. 一键开发运行
使用 pnpm 启动所有应用：
```bash
pnpm install
pnpm dev
```
- **3D 展示前端**: [http://localhost:3000](http://localhost:3000)
- **后台管理系统**: [http://localhost:8080](http://localhost:8080) (使用 Supabase 认证登录)

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
