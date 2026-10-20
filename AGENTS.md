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

### 3D 场景的坐标体系（Stage Coordinate System）
> 场景里的每个部件都站在同一个「舞台」上，坐标只有一处定义。

- `lib/stage.ts` 定义地板高度 `GROUND_Y`、标题高度 `TITLE_Y`、以及相机要框住的
  内容尺寸。
- `Scene.tsx` 用 `<group position={[0, GROUND_Y, 0]}>` 包住整个场景，
  **舞台内部一律以地板为 `y = 0`**。
- 圣诞树的几何写在 `lib/treeLayout.ts`，**树和相册共用**——照片必须真的挂在
  树枝上。改树的形状请改 `treeLayout.ts`，不要改组件里的魔法数字。
- 相机的位置/视场角由 `lib/cameraFraming.ts` 根据视口宽高比算出，
  `components/CameraRig.tsx` 在运行时同步给 three.js。

### 3D 场景资源红线（Scene Asset Rules）
> 以下规则来自一次真实的「整个 3D 场景永久空白」事故，改动场景相关代码前必读。

1. **禁止远程资源**。字体、贴图一律自托管在 `apps/web/public/` 下，路径统一由
   `apps/web/lib/assets.ts` 导出。drei 的 `useTexture` / troika 的字体预加载在资源
   不可达时**不会超时、不会报错**，只会永久挂起 `<Suspense>`。
   字体是子集版（`zcool-qingke-huangyou.woff2`，约 900 KB），由
   `scripts/subset-display-font.py` 从固定地址（带 SHA256 校验）生成；
   贴图由 `scripts/generate-textures.mjs` 本地生成。
2. **会挂起的组件必须独立边界**。`Scene.tsx` 的外层 `<Suspense>` 覆盖整个场景：
   其中任何组件挂起 = 全场空白。请把 `<Text>`、`<Cloud>` 这类组件
   各自包一层 `<Suspense>`，失败只影响自己。外层边界现在**不是** `fallback={null}`，
   而是渲染一个可见的占位网格——挂起时访客看到加载态，而不是空白页。
3. **注意 drei 的 prop 归属**。`<Cloud>` 会丢弃 `texture` prop（属于 `<Clouds>`），
   静默回落到 CDN 默认值。需要自定义贴图请用 `<Clouds texture=…>` +
   `<CloudInstance>`。`<Environment>` 同理：**只能用 children（`<Lightformer>`），
   不能用 `preset` / `files`**——那会从 CDN 下载 HDR。
4. **3D 坐标要验算视锥**。相机的 `lookAt` 由 `lib/cameraFraming.ts` 统一计算，
   目标点是 `[0, GROUND_Y + 3.9, 0]`（不是原点）。改标题位置后请用截图确认。
5. **中文标题用 DOM 方案**。troika 需要为 3.4 MB 中文全字集生成 SDF，实测不可用；
   改用 drei `<Html>` + CSS `@font-face`（见 `components/SceneTitle.tsx`）。
6. **验证要看画面，不要只看 canvas**。`<canvas>` 存在不代表场景有内容。E2E 断言
   标题可见（`tests/monorepo.spec.js`），并且不允许加载任何第三方图片/字体；
   另有像素级断言（`tests/scenePixels.js`）确保画面不是一片纯色。
   手动复核用 `pnpm audit:scene`——它会截图并统计每帧 draw call。
7. **dev server 缓存会骗人**。改动 CSS / 资源后若行为不符预期，先
   `rm -rf apps/web/.next` 再重启 `next dev`，Turbopack 的增量缓存可能继续吐旧产物。
   **必须先停掉 dev server 再删缓存**，否则 Turbopack 的持久化数据库会损坏
   （`Unable to open static sorted file` + panic）。

### 3D 场景性能红线（Scene Performance Rules）
> 以下规则来自一次「一帧要渲染整个场景八次」的性能事故。

1. **会动的点光源不能投影**。`castShadow` 的点光源每帧要把整个场景渲染 6 次
   （立方体阴影的 6 个面）。场景里唯一会动的点光源因此**不投影**。
2. **慎用 `transmission`**。`MeshPhysicalMaterial.transmission` 会让 three.js
   每帧多渲染一遍场景到透射缓冲。玻璃质感改用「环境贴图 + `opacity`」实现
   （见 `Ornament.tsx` 的玻璃外壳）。
3. **不要每帧一个 `useFrame`**。气球、树灯、烟花、装饰球各自一个回调
   = 上百个回调/帧。改成 `<instancedMesh>` + **一个** `useFrame` 批量写矩阵。
4. **动画要用时钟，不要用 `+=`**。`rotation.y += 0.01` 在 144 Hz 上比 60 Hz 快
   一倍多。统一用 `state.clock.elapsedTime` 或 `delta`。
5. **画质参数只有一个出处**：`lib/sceneQuality.ts` 的 `getSceneQuality()`。
   不要在组件里另写一套粒子数 / 阴影开关 / DPR。
6. **物理世界要真的用到**。旧的 `<Physics>` 里一个刚体都没有，cannon 每帧白跑。
   没有刚体就别包 `<Physics>`。
7. **GPU 资源要释放**。贴图用 `lib/textureCache.ts`（引用计数，最后一个使用者
   释放时才 `dispose()`）；`useMemo` 出来的 geometry / material 必须在
   `useEffect` 的清理函数里 `dispose()`。

---

## Agent Autopilot & Handover
- Check `implementation_plan.md` for full design sheets before approving major features.
- Track progress via `task.md` during execution.
- Review `walkthrough.md` after completion for detailed diff files and compile tests.
