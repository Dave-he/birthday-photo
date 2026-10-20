# AI Agents Collaboration Guidelines (AGENTS.md)

Welcome to the Birthday Photo - 3D Electronic Gallery Project! This document specifies how AI Coding Agents (like **Antigravity**) collaborate with developers and automated systems to maintain, expand, and refactor this codebase.

---

## AI Agent Capabilities & Responsibilities

The AI Agents are equipped to autonomously perform development tasks inside the project workspace:
1. **Core Development**: Refactor and extend the Next.js/React Three Fiber 3D client (`apps/web`) and Refine admin panel (`apps/admin`).
2. **Database & Storage Connection**: Auto-configure PostgreSQL and Supabase environment variables, test SQL scripts in local docker environments, and implement CORS-safe media loading.
3. **CI/CD Pipeline Maintenance**: Monitor and fix GitHub Actions workflow runs, optimize multi-stage Docker build files.
4. **Performance Tuning**: Adjust adaptive DPR (Device Pixel Ratio) and dynamic post-processing bloom/vignette intensities depending on hardware specs.

---

## AI Collaboration Best Practices

When delegating tasks to an AI Agent or using slash commands:

### 1. Using Slash Commands in Chat UI
- `/goal`: Trigger when you want the agent to carry out long-running, thorough iterations (e.g., refactoring 3D visual styles, implementing new components, adding performance tests).
- `/grill-me`: Recommend starting an interactive interview with the agent to align on design ideas, color palettes (e.g., Christmas, Birthday, Romantic, Party presets), and architectural preferences.
- `/schedule`: Set a recurring health monitor or build checker (e.g., checks every night for compile breaks).

### 2. Sandbox Development Isolation
- AI Agents compile and test the apps in separate local sandboxes.
- The `docker-compose.yml` provides absolute sandbox parity with real-world deployments.
- Always check that `.env` files are updated with the correct local Supabase endpoints before starting the development environment.

---

## Technical Specifications for Agents

### Monorepo Structure
- **apps/web**: Next.js App Router. Custom R3F elements should always use the custom `useState/useEffect` asynchronous texture loaders rather than synchronous Drei suspenders to avoid CORS/404 canvas blackouts.
- **apps/admin**: Refine framework with Ant Design. When calling `useList` or other data providers, retrieve properties safely from `photosQuery.result` (data/total) and `photosQuery.query.isLoading`.

### 3D 场景资源红线（Scene Asset Rules）
> 以下规则来自一次真实的「整个 3D 场景永久空白」事故，改动场景相关代码前必读。

1. **禁止远程资源**。字体、贴图一律自托管在 `apps/web/public/` 下，路径统一由
   `apps/web/lib/assets.ts` 导出。drei 的 `useTexture` / troika 的字体预加载在资源
   不可达时**不会超时、不会报错**，只会永久挂起 `<Suspense>`。
2. **会挂起的组件必须独立边界**。`Scene.tsx` 的外层 `<Suspense fallback={null}>`
   覆盖整个场景：其中任何组件挂起 = 全场空白。请把 `<Text>`、`<Cloud>` 这类组件
   各自包一层 `<Suspense>`，失败只影响自己。
3. **注意 drei 的 prop 归属**。`<Cloud>` 会丢弃 `texture` prop（属于 `<Clouds>`），
   静默回落到 CDN 默认值。需要自定义贴图请用 `<Clouds texture=…>` +
   `<CloudInstance>`。
4. **3D 坐标要验算视锥**。相机的 `lookAt` 是原点，`fov` 45° 时 `y > 5` 的元素
   已经在画面之外。改标题位置后请用截图确认。
5. **中文标题用 DOM 方案**。troika 需要为 3.4 MB 中文全字集生成 SDF，实测不可用；
   改用 drei `<Html>` + CSS `@font-face`（见 `components/SceneTitle.tsx`）。
6. **验证要看画面，不要只看 canvas**。`<canvas>` 存在不代表场景有内容。E2E 断言
   标题可见（`tests/monorepo.spec.js`），并且不允许加载任何第三方图片/字体。
7. **dev server 缓存会骗人**。改动 CSS / 资源后若行为不符预期，先 `rm -rf
   apps/web/.next` 再重启 `next dev`，Turbopack 的增量缓存可能继续吐旧产物。

---

## Agent Autopilot & Handover
- Check `implementation_plan.md` for full design sheets before approving major features.
- Track progress via `task.md` during execution.
- Review `walkthrough.md` after completion for detailed diff files and compile tests.
