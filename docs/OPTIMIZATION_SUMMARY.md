# 项目优化总结

> 最后更新：本轮「继续完善」改造之后。文中所有版本号、目录结构与命令均以仓库当前代码为准。

## 零、本轮最严重的问题：整个 3D 场景曾经永久空白

> 这是本轮排查出的**最高优先级缺陷**，在此单列。

### 现象

访客点「ENTER EXPERIENCE」后进入 3D 场景，**画面完全空白**——没有圣诞树、没有
礼盒、没有粒子、没有标题，只有底部的 HUD 悬浮条。控制台没有报错。

### 根因

R3F 的 `<Suspense fallback={null}>` 包裹了整个场景（`Scene.tsx`）。只要其中**任意
一个**组件挂起且永不恢复，React 就不会提交这棵子树——整个场景保持空白。

而当时有两个组件满足这个条件：

1. **drei 的 `<Cloud>`**
   `<Cloud>` 的默认贴图托管在公共 CDN
   `https://rawcdn.githack.com/pmndrs/drei-assets/.../cloud.png`。
   `useTexture` → `useLoader` 会一直挂起直到贴图到位；CDN 不可达（内网、离线、
   被墙、CDN 迁移）时**没有任何超时，也没有错误回调**，Promise 永远 pending。

   更隐蔽的是：`<Cloud>` 只是个薄包装，它把 `texture` prop 丢掉了——真正接受
   `texture` 的是 `<Clouds>`。所以就算给 `<Cloud>` 传 `texture` 也无效，代码会
   静默回落到 CDN 默认值。

2. **drei 的 `<Text>`（troika 字体管线）**
   `<Text>` 硬编码的 ZCOOL 字体地址
   `https://fonts.gstatic.com/.../v5/nqyJcc1t_c2bVf5t3-8k9BdfGv1C7G_A.woff`
   **早已 404**（Google 已改版到 v16）。troika 的 `doLoadFont` 在失败时**只打印
   日志、从不回调**，于是 `suspend-react` 的 Promise 永远不 resolve，标题组件
   永久挂起。

   顺带一提：即使字体正常，troika 还要为 3.4 MB 的中文全字集生成 SDF 字形，
   实测在完整版 Chrome 中也不会在合理时间内完成。

### 修复

| 项目 | 修复前 | 修复后 |
| --- | --- | --- |
| 字体 | 硬编码 gstatic v5 地址（已 404） | 自托管 `apps/web/public/fonts/zcool-qingke-huangyou.woff`，由 `lib/assets.ts` 统一管理 |
| 3D 标题 | troika `<Text>`（永久挂起） | `SceneTitle.tsx` — drei `<Html>` + CSS `@font-face`，走浏览器原生字体渲染 |
| 云朵贴图 | drei CDN 默认值 | 自托管 `apps/web/public/textures/cloud.png`（由 `scripts/generate-textures.mjs` 程序化生成） |
| 挂起隔离 | 整个场景共用一个 `<Suspense>` | 会挂起的组件各自独立 `<Suspense>` 边界，失败只影响自己 |
| 标题位置 | `y = 6.5`（**在相机视锥外**，即使字体正常也看不见） | `y = 4.2`，并加了 E2E 断言 |
| 跳舞情侣 | 基准高度 `+8`（同样在视锥外，只露出一个角） | 基准高度 `+1.8`，四种模式逐一截图复核 |

现在场景所需的字体与贴图全部来自本仓库 origin，**零第三方资源依赖**。

### 回归防护

E2E 新增两条断言（`tests/monorepo.spec.js`）：

- 场景标题必须可见且非空——`<canvas>` 存在**不能**证明场景有内容（空白场景
  同样有 canvas），标题挂在 R3F 场景树里，它出现才代表场景真的提交了；
- 场景加载过程中**不得发起任何第三方图片/字体/样式请求**。

---

## 一、本轮修复的其他真实缺陷

### 1. 后端不可达时 3D 客户端永久卡死（P0）

`useStore.fetchInitialData` 之前没有捕获 `dataService` 抛出的异常。一旦 Supabase
不可达（连不上、502、超时），Promise 直接 reject：

- `isLoading` 永远停在 `true`；
- `Overlay` 永远显示 “Loading Magic...”，**访客无法进入 3D 场景**；
- 控制台只有一条未捕获的 Promise rejection。

修复后：异常被收敛到 store 的 `error` 字段，`Overlay` 展示可读的错误提示 + “重试”
按钮，并允许访客**继续进入场景**（画廊为空，3D 场景本身不依赖后端）。

新增纯函数模块 `apps/web/lib/loadState.ts`：

- `describeLoadError(error)` — 把 `fetch failed` 之类的底层报错翻译成可读提示；
- `resolveInitialSceneId(settings, scenes)` — 落幕场景的解析规则。

### 2. 后台照片列表的「查看」按钮是死链（P0）

`photos/list.tsx` 渲染了 `<ShowButton>`，但 `App.tsx` 从未注册 `show` 路由，
点击后直接落到 `<Route path="*" element={<ErrorComponent />} />` 错误页。

修复：新增 `apps/admin/src/pages/photos/show.tsx` 详情页，并在 `App.tsx` 中同时
注册资源级 `show: "/photos/show/:id"` 与路由 `<Route path="show/:id" …>`。

### 3. 低画质模式会冻结整个 3D 场景（P1）

`Canvas` 之前使用 `frameloop={isLow ? 'demand' : 'always'}`。R3F 的 `demand` 模式
只在 `invalidate()` 时渲染，而场景中的**每一个**动画都跑在 `useFrame` 里
（气球、烟花、粒子、装饰球、相机自动旋转）。结果：一旦开启低画质模式
（`settings.low_quality_mode` 或 HUD 切到 `low`），整个场景静止不动。

修复：帧循环固定为 `always`；画质改由 DPR、阴影、粒子数量与输入阻尼控制，
这些维度在 `getAdaptiveDpr` / `getAdaptiveEventsConfig` / `SceneEffects` 中已有实现。

### 4. HUD「Save Configuration」按钮名不副实（P1）

该按钮声称保存当前场景，实际执行的是把 `greeting_title` 写成它自己的原值
（一次 no-op 更新），用户在界面上完全看不出任何变化。

修复：新增三个 settings 字段并把读写链路接通：

| 字段 | 写入方 | 读取方 |
| --- | --- | --- |
| `default_scene_id` | HUD 保存按钮 / 后台设置页 | 3D 客户端首屏落幕场景 |
| `default_mode` | HUD 保存按钮 / 后台设置页 | 3D 客户端初始模式 |
| `default_layout` | HUD 保存按钮 / 后台设置页 | 3D 客户端初始布局 |

存量数据库需补跑 `database/migrations/001_settings_defaults.sql`（幂等）。

同时 `useAutoMode` 的自动轮播改为基于**当前状态**推导下一组
（`getNextCycleState`），因此从 `default_mode` 恢复出来的场景能接着轮播，
而不是每次都跳回列表第一项。

### 4b. 后端不可达时请求会挂死（P1）

Supabase 客户端没有超时。目标主机不可达时（丢包而非快速拒绝），`fetch` 会一直
挂到操作系统的 TCP 超时——访客盯着「Loading Magic...」一两分钟。

修复：web 与 admin 两侧的 Supabase 客户端都接上 `AbortController`（10 秒上限，
`AbortSignal.any` 合并外部 signal），把「无限等待」变成「10 秒后明确报错」。

### 5. 相册全量拉取后在浏览器里过滤（P1）

`dataService.getPhotos()` 之前无视场景，一次性拉取全部照片再在前端按
`scene_id` 过滤。现在过滤条件下推到 PostgREST（`.eq('scene_id', …)`）。

`getSettings()` 也从 `.single()` 改为 `.limit(1).maybeSingle()`：settings 表是
单例，但空表时 `.single()` 会报错，`.maybeSingle()` 才会正确返回 `null`。

### 6. 照片详情弹窗缺少键盘可达性（P2）

新增：ESC 关闭、← → 翻页、打开时把焦点移入对话框、关闭后恢复焦点、锁定背景滚动，
并在角标显示 `第 n / N` 张。

### 7. 根目录脚本与 CI 缺失（P2）

README 一直宣传根目录 `pnpm dev`，但根 `package.json` 没有任何 dev 脚本。
现已补齐 `dev` / `build` / `typecheck` / `test` 系列脚本：

- `pnpm dev` — 通过 `scripts/dev.mjs`（零依赖）同时拉起 web 与 admin；
- `pnpm dev:web` / `pnpm dev:admin` — 单端启动；
- `pnpm typecheck` / `pnpm build` / `pnpm test:unit`；
- `pnpm install:all` — 一次性安装三个安装根（web / admin / 根工具链）。

CI（`.github/workflows/build-and-test.yml`）新增了 **单元测试** 与 **双端类型检查**
两个环节，之前的流水线只做构建，类型错误可以一路溜到主干。

### 8. E2E 断言太弱，测不出「场景空白」（P1）

原断言只检查 `<canvas>` 是否可见——但**空白场景同样有 canvas**，所以这个用例
在场景早已空白的情况下依然「通过」。另外它与加载动画存在竞态：按钮还没出现就
跳过了点击，HUD 断言随机失败。

现在：

- 等待「ENTER EXPERIENCE」按钮真正出现再点击（消除竞态）；
- 断言场景标题可见且非空——标题挂在 R3F 场景树里，它出现才代表场景真的提交；
- 新增「后端不可达时场景仍然可用」用例；
- 新增「场景资源必须全部来自本站 origin」用例，拦截第三方图片/字体/样式请求；
- 用 `.scene-canvas canvas` 精确定位 R3F 画布（drei `<Stats>` 还会渲染若干
  小 canvas，原来的 `page.locator('canvas')` 会命中多个元素）。

### 9. 文档与代码漂移（P2）

`docs/OPTIMIZATION_SUMMARY.md` 曾描述 Next.js 14 / React 18 以及一个并不存在的
`packages/` 目录，`PROJECT_GUIDE.md` 里的端口号也与实际不符。相关文档已同步。

---

## 一之二、续作：存储桶、字体体积与图片质量

### 10. 背景音乐上传实际是坏的（P1）

后台的「Upload Music File」把音频传进 `photos` 桶——而按文档创建的 `photos` 桶
只允许图片 MIME 类型，**MP3 会被存储层直接拒绝**，而界面上只显示一句
"Upload failed."。

修复：

- 新增 `database/storage.sql`（幂等）创建两个 Public Bucket 及其策略：
  `photos`（仅图片）与 `music`（仅音频）。存储配置从此**可脚本化**，
  不再依赖「在 Dashboard 里手动建桶」；
- 后台设置页改用 `music` 桶；
- 新增 `describeUploadError()`，把「桶不存在 / MIME 被拒 / 未登录 / 文件过大」
  翻译成可读提示（并有单测覆盖）；
- 仪表盘的系统状态卡分别探测两个桶，缺桶一眼可见。

### 11. 中文字体 3.3 MB → 897 KB（P2）

完整中文字体对「只显示一行标题」来说太重。新增
`scripts/subset-display-font.py`：从**固定地址 + SHA256 校验**的上游文件取源，
用 Python 内置的 GB2312 编解码器枚举出 3755 个常用简体字，加上拉丁字符与
CJK 标点，子集化成 woff2——**省 73%**。生成本身可离线复现，构建不依赖网络。

同时：字体加 `<link rel="preload">`，`/fonts` 与 `/textures` 加上一周缓存头
（Next.js 默认对 public 资源 `max-age=0`，等于每次访问都重下）。

### 12. 照片贴图颜色不对、失败时空白（P2）

`Ornament` 的贴图没设置 `colorSpace = SRGBColorSpace`——渲染器把 sRGB 照片当
线性数据处理，**整个相册偏暗发灰**；也没设各向异性过滤，斜看时糊。

另外照片加载失败时回退到**远程 Unsplash 地址**——网络正是出问题时，这个回退
必然也失败，装饰球直接空白。改为自托管占位图。

### 13. 中文标题的 E2E 回归用例（P2）

新增用例断言：字体确实被加载（`document.fonts.check`）、计算出的
`font-family` 确实是 ZCOOL、且四个字形有合理的排版宽度——防止子集化或
CSS 改动把中文悄悄退化成豆腐块。

---

## 二、既有优化（保留）

### 1. 类型安全

- `Scene.tsx`：修正 `adaptiveDpr` 返回类型、移除不存在的 `touchSensitivity` 属性、
  兼容 Next.js Image 组件类型。
- `SceneHUD.tsx`：修正 `settings?.id` 可能为 `undefined` 的问题。

### 2. 构建配置

**Web（Next.js）**

- TypeScript 严格模式（`ignoreBuildErrors: false`）
- 远程图片白名单
- `compress` / `poweredByHeader: false` / `reactStrictMode` / `swcMinify`
- `turbopack.root` 显式指向 `apps/web`，避免 Next.js 误判 monorepo 根目录而
  监听整个仓库

**Admin（Vite）**

- React / Ant Design / Refine 分包——**本轮才真正落地**：`vite.config.ts` 里此前
  并没有 `manualChunks`，产物是单个 2 MB chunk。补上后入口从 2 MB 降到 27 KB：

  | chunk | 原始 | gzip |
  | --- | --- | --- |
  | `index`（应用代码） | 27 KB | 7.5 KB |
  | `refine` | 127 KB | 38 KB |
  | `supabase` | 165 KB | 43 KB |
  | `react` | 194 KB | 61 KB |
  | `vendor` | 418 KB | 140 KB |
  | `antd` | 1.07 MB | 335 KB |

- chunk 告警阈值提升到 1200KB
- CSS 代码分割、esbuild 压缩、依赖预构建

### 3. 开发体验

- `refine dev` 会顺带拉起 Refine Devtools 服务，在受限网络下**卡死不退出**，
  Vite 根本起不来。`apps/admin` 的 `dev` 脚本改为 `refine dev --devtools false`，
  需要 devtools 时用 `pnpm --dir apps/admin dev:devtools`。
- `<DevtoolsPanel />` 仅在 `import.meta.env.DEV` 下渲染，生产包不再携带
  devtools 运行时。

### 4. 性能

- 自适应 DPR（`getAdaptiveDpr`）
- `PerformanceMonitor` 自动降级
- 粒子数量按 `particle_multiplier` 与画质档位分级（`SceneEffects`）
- Zustand 选择器订阅（`useShallow`），避免无关状态变化触发 3D 场景重渲染
- Supabase 请求 10 秒超时，避免后端不可达时无限等待

---

## 三、当前技术栈

| 模块 | 技术 |
| --- | --- |
| Web | Next.js 16.1.1 (Turbopack) · React 19.2.3 · React Three Fiber 9 · Drei 10 · Three 0.182 · Framer Motion 12 · Zustand 5 |
| Admin | Vite 6 · React 19.2 · Refine 5 (`@refinedev/antd` 6) · Ant Design 5.23 |
| 数据 | Supabase (PostgreSQL + Storage) · `@supabase/supabase-js` 2.89 |
| 校验 | `node:test` 单元测试 · Playwright E2E · `tsc --noEmit` 双端类型检查 |

## 四、目录结构

```
birthday-photo/
├── apps/
│   ├── admin/          # 后台管理 (Vite + Refine + AntD)
│   └── web/            # 3D 展示端 (Next.js + R3F)
│       └── public/
│           ├── fonts/      # 自托管 ZCOOL 中文字体
│           └── textures/   # 自托管程序化生成的云朵贴图
├── database/
│   ├── schema.sql      # 建表脚本
│   ├── policy.sql      # RLS 策略
│   ├── storage.sql     # Storage 桶与对象策略（photos / music）
│   ├── test_data.sql   # 演示数据
│   └── migrations/     # 存量库的增量迁移
├── scripts/
│   ├── dev.mjs                    # 零依赖的并行开发服务器启动器
│   ├── generate-textures.mjs      # 程序化生成云朵 / 占位贴图（无需联网）
│   └── subset-display-font.py     # 中文字体子集化（固定地址 + SHA256 校验）
├── tests/
│   ├── unit/           # node:test 纯逻辑测试
│   └── *.spec.js       # Playwright E2E
└── package.json        # 仓库级脚本入口
```

## 五、运行命令

```bash
pnpm install:all     # 安装 web / admin / 根工具链依赖
pnpm dev             # 并行启动双端（web:3000, admin:5173）
pnpm typecheck       # 双端类型检查
pnpm test:unit       # 单元测试
pnpm test:e2e        # Playwright E2E
pnpm build           # 双端生产构建
```

> `apps/web/public/fonts/zcool-qingke-huangyou.woff2` 为自托管的 ZCOOL 中文字体子集
> （约 900 KB，Latin + 标点 + 3755 个常用简体字）；重新生成：
> `python3 scripts/subset-display-font.py --download apps/web/public/fonts/zcool-qingke-huangyou.woff2`。
> 云朵与占位贴图可用 `node scripts/generate-textures.mjs` 重新生成，均无需联网。

## 六、后续可做

1. **图片优化** — 统一走 Next.js Image 的 `sizes` / `quality`，或预生成 WebP。
2. **缓存策略** — 为只读接口补 HTTP 缓存头，离线场景引入 Service Worker。
3. **可观测性** — 接入 `pnpm analyze` 与 Lighthouse，建立体积回归基线。
4. **音乐存储桶** — 目前背景音乐与图片共用 `photos` 桶，建议拆分独立 bucket 与 MIME 白名单。
5. **字体极端字符** — 子集覆盖 3755 个常用简体字，生僻字会回退到系统 CJK 字体；
   若需完整字集，可用 `scripts/subset-display-font.py` 扩大字符集重新生成。
