# 6. 部署与运维 (Deployment & DevOps)

## 6.1 环境变量 (Environment Variables)

无论是本地开发还是生产部署，都需要配置环境变量。请参考 `.env.example`。

### Root / Shared
```bash
# Supabase 连接信息
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxh...
```

> 注意：`NEXT_PUBLIC_` 前缀确保变量暴露给 Next.js 浏览器端。Vite (Admin) 端会自动读取相同的 `.env` 文件，但在代码中需通过 `import.meta.env.VITE_SUPABASE_URL` (需在 `vite.config.ts` 中配置映射或直接使用 `VITE_` 前缀的变量)。为了简化，建议在 `.env` 中同时定义两套或配置 Vite 加载 `NEXT_PUBLIC_` 变量。

## 6.2 本地开发 (Local Development)

1.  **安装依赖**:
    ```bash
    pnpm install
    ```
2.  **启动开发服务器**:
    ```bash
    # 启动所有应用
    pnpm dev
    
    # 仅启动 Web
    pnpm --filter web dev
    
    # 仅启动 Admin
    pnpm --filter admin dev
    ```

## 6.3 Docker 部署

项目提供了 `docker-compose.yml` 用于一键部署。

1.  **构建镜像**:
    ```bash
    docker-compose build
    ```
2.  **启动服务**:
    ```bash
    docker-compose up -d
    ```
3.  **端口映射**:
    - Web App: `http://localhost:3000`
    - Admin App: `http://localhost:8080` (映射自容器内的 80 端口，由 Nginx 服务)

### Dockerfile 说明
- **Web**: 使用 Next.js 的 Standalone 模式构建，减小镜像体积。
- **Admin**: 构建为静态文件 (HTML/CSS/JS)，使用 Nginx 容器进行托管。

## 6.4 生产环境建议 (Production)

### 托管平台推荐
- **Web (Next.js)**: 推荐部署到 [Vercel](https://vercel.com)。它提供最佳的 Next.js 支持、全球 CDN 和 Serverless Functions。
- **Admin (Static)**: 可以部署到 Vercel, Netlify, 或任何静态网站托管服务 (AWS S3 + CloudFront)。

### CI/CD
建议配置 GitHub Actions：
- **Lint & Test**: 每次 Push 触发 ESLint 和 Unit Tests。
- **Preview**: PR 自动部署预览环境。
- **Deploy**: Merge 到 main 分支自动部署到生产环境。

### 性能调优
- **CDN**: 确保 Supabase Storage 开启了 CDN 加速。
- **Asset Optimization**: 3D 模型 (GLTF/GLB) 应使用 `gltf-pipeline` 进行压缩 (Draco compression)。
