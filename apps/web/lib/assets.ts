/**
 * Self-hosted scene assets.
 *
 * Every asset the 3D scene needs at runtime is served from our own origin.
 * drei's loaders (`useTexture`, and the font preload behind `<Text>`) suspend
 * until the asset arrives and — importantly — never report a failure back to
 * React. A single unreachable CDN therefore used to leave the whole
 * `<Suspense>` boundary pending and the entire scene blank.
 *
 * Hosting the assets locally removes the external dependency entirely (and
 * keeps the gallery working on networks where Google Fonts / GitHub CDNs are
 * blocked).
 */

/** Display font for the 3D title (ZCOOL QingKe HuangYou). */
export const DISPLAY_FONT_URL = '/fonts/zcool-qingke-huangyou.woff'

/** Soft puff texture used by the atmospheric clouds. */
export const CLOUD_TEXTURE_URL = '/textures/cloud.png'
