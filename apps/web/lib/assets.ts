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

/**
 * Display font for the 3D title (ZCOOL QingKe HuangYou).
 *
 * A subset: the full Chinese font is ~3.3 MB, the shipped subset (Latin,
 * punctuation and the 3755 most common simplified Chinese characters) is
 * ~900 KB. Characters outside the subset fall back to the CJK system fonts
 * declared in the CSS stack.
 *
 * Regenerate with `python3 scripts/subset-display-font.py --download <target>`.
 */
export const DISPLAY_FONT_URL = '/fonts/zcool-qingke-huangyou.woff2'

/** Soft puff texture used by the atmospheric clouds. */
export const CLOUD_TEXTURE_URL = '/textures/cloud.png'

/**
 * Stand-in for a photo that could not be loaded.
 *
 * Self-hosted on purpose: the previous fallback was a remote Unsplash URL,
 * which fails exactly when the network is the problem - leaving the
 * ornament blank instead of showing a placeholder.
 */
export const PLACEHOLDER_TEXTURE_URL = '/textures/placeholder.png'

/**
 * The floor disc.
 *
 * White with a radial alpha falloff, so the material's colour decides how
 * the floor looks while the alpha lets it dissolve into the fog.
 */
export const GROUND_TEXTURE_URL = '/textures/ground.png'
