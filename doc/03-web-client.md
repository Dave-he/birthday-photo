# 3. 前台展示端详解 (Web Client)

位于 `apps/web` 目录，是用户直接交互的 3D 展示界面。

## 3.1 核心组件架构

### `Scene.tsx` (场景控制器)
这是整个 3D 体验的入口组件。
- **状态管理**：维护 `currentSceneId` (当前场景), `mode` (当前模式), `galleryLayout` (排列方式) 等核心状态。
- **生命周期**：
  1.  `useEffect`: 初始化加载 Supabase 数据（Scenes, Settings）。
  2.  `useEffect`: 监听 `hasStarted`，启动定时器自动轮播 Mode 和 Layout。
  3.  `useEffect`: 处理背景音乐的播放/暂停逻辑。
- **渲染职责**：负责渲染 `<Canvas>`，以及其中的 `<Environment>`, `<Lights>`, `<OrbitControls>` 和具体的业务组件。

### `PhotoGallery.tsx` (3D 照片画廊)
负责将照片数组渲染为 3D 空间中的对象。
- **布局算法**：
  - **Tree**: 根据斐波那契螺旋或其他算法，将照片分布在圆锥体表面，模拟圣诞树挂饰。
  - **Helix**: 螺旋上升排列，类似 DNA 结构。
  - **Sphere**: 分布在球体表面。
  - **Grid**: 平面网格排列。
- **实现细节**：接收 `layout` prop，实时计算每个 Photo 的 `position` 和 `rotation`，并使用 `react-spring` 或 `framer-motion-3d` 进行平滑过渡。

### 装饰性组件
- **`Tree.tsx`**: 程序化生成的几何体或加载的 GLTF 模型，作为 Christmas 模式的主体。
- **`Fireworks.tsx`**: 使用 ShaderMaterial 或 `Points` 粒子系统模拟烟花爆炸。
- **`Balloons.tsx`**: 使用 InstancedMesh 渲染大量漂浮的气球，优化性能。

### `Overlay.tsx` & HUD
- 位于 Canvas 之上的 2D HTML 层。
- **Loading Screen**: 初始加载时的全屏遮罩。
- **Start Button**: 由于浏览器自动播放策略限制，需要用户首次交互（点击 Start）才能播放音乐和进入场景。
- **Modal**: 点击 3D 照片后弹出的详情页。
 - **HUD 质量预设**: 提供 Auto/Low/High 预设与旋转速度快捷键，实时调整粒子密度与自动旋转速度，便于不同设备快速获得合适体验。

## 3.2 关键技术点

### 后期处理 (Post Processing)
使用了 `@react-three/postprocessing` 库增强视觉效果：
- **Bloom**: 泛光效果，让灯光、星星和照片的高光部分产生朦胧的光晕，增加梦幻感。
- **Vignette**: 暗角效果，压暗屏幕边缘，引导视线集中在画面中心。
- **Noise**: (可选) 添加轻微噪点，模拟胶片质感。

### 性能优化
- **InstancedMesh**: 对于大量重复物体（如雪花、气球），使用实例化渲染，大幅减少 Draw Call。
- **Texture Compression**: 建议上传前压缩图片，或使用 Next.js Image Optimization 配合纹理加载器。
- **Suspense**: 使用 React Suspense 配合 `useLoader`，实现资源的异步加载和 Fallback 显示。
- **低画质模式**: 通过 `settings.low_quality_mode` 和 `settings.particle_multiplier` 动态调整粒子数量、星空密度与画布 `dpr`，在移动端显著提升流畅度。

## 3.3 模式 (Modes) 与 布局 (Layouts) 对照表

| 模式 (Mode) | 默认布局 (Layout) | 专属元素 | 背景氛围 |
| :--- | :--- | :--- | :--- |
| **Christmas** | Tree | 圣诞树, 礼物盒 | 飘雪, 宁静夜空 |
| **Birthday** | Helix | 蛋糕, 气球 | 漂浮气球, 暖色光 |
| **Romantic** | Sphere | 舞动情侣(模型), 爱心 | 粉色粒子, 柔光 |
| **Party** | Grid | 烟花 | 烟花绽放, 动态光 |
