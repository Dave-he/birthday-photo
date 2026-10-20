const { test, expect } = require('@playwright/test');
const { analyseImage } = require('./scenePixels.js');

/**
 * The admin panel runs on Vite's default dev port (5173). The Docker image
 * serves the production build on 8080 — override with E2E_ADMIN_URL when
 * running the suite against a containerised admin.
 */
const ADMIN_URL = process.env.E2E_ADMIN_URL || 'http://localhost:5173';

/**
 * Enter the scene and wait until it has actually committed.
 *
 * The floating title only exists once the R3F tree has rendered, so it is
 * the reliable "the scene is really there" signal.
 */
async function enterScene(page) {
  await page.goto('/');
  const enterButton = page.locator('button:has-text("ENTER EXPERIENCE")');
  await enterButton.waitFor({ timeout: 30000 });
  await enterButton.click();
  await expect(page.locator('.font-display')).toBeVisible({ timeout: 20000 });
  return page.locator('.scene-canvas canvas');
}

test.describe('Birthday Photo - 3D Electronic Gallery E2E Tests', () => {

  test('should successfully load the 3D Front-end Exhibition', async ({ page }) => {
    // Navigate to local Next.js app
    await page.goto('/');

    // 1. Verify Welcome Overlay
    const title = page.locator('h1');
    await expect(title).toBeVisible();
    console.log('Overlay Welcome title loaded successfully.');

    // 2. Click Enter Experience
    //    The button only appears once the initial load settled (either the
    //    gallery loaded or the backend turned out to be unreachable), so wait
    //    for it instead of racing the spinner.
    const enterButton = page.locator('button:has-text("ENTER EXPERIENCE")');
    await expect(enterButton).toBeVisible({ timeout: 20000 });
    await enterButton.click();
    console.log('Clicked "ENTER EXPERIENCE" successfully.');

    // 3. Verify 3D Canvas
    const canvas = page.locator('.scene-canvas canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    console.log('3D WebGL Canvas successfully compiled and rendered on screen!');

    // 3b. Verify the scene actually has content.
    //     A visible <canvas> proves nothing — a blank scene also has a canvas.
    //     The floating title is rendered inside the R3F tree, so it only
    //     appears once the scene graph has committed. This is the regression
    //     guard for the "one unreachable asset blanked the whole gallery" bug.
    const sceneTitle = page.locator('.font-display');
    await expect(sceneTitle).toBeVisible({ timeout: 15000 });
    await expect(sceneTitle).not.toBeEmpty();
    console.log(`Scene title rendered: "${await sceneTitle.innerText()}"`);

    // 4. Verify HUD Controls
    const hudContainer = page.locator('.bg-black\\/30.backdrop-blur-xl');
    await expect(hudContainer).toBeVisible();
    console.log('HUD Glassmorphism panel verified on screen.');
  });

  test('should keep the 3D scene reachable when the photo server is down', async ({ page }) => {
    // The gallery is optional: a Supabase outage must not trap the visitor on
    // the loading screen. The scene has to render (and stay enterable) anyway.
    await page.route('**/rest/v1/**', (route) => route.abort());

    await page.goto('/');

    const title = page.locator('h1');
    await expect(title).toBeVisible();

    const enterButton = page.locator('button:has-text("ENTER EXPERIENCE")');
    await expect(enterButton).toBeVisible({ timeout: 15000 });
    await enterButton.click();

    await expect(page.locator('.scene-canvas canvas')).toBeVisible({ timeout: 10000 });

    // The 3D scene must still be there — a dead backend is not allowed to
    // take the gallery down with it.
    await expect(page.locator('.font-display')).toBeVisible({ timeout: 15000 });
    console.log('Degraded mode still renders the 3D scene without a backend.');
  });

  test('should load every scene asset from the app origin', async ({ page }) => {
    // Remote assets (fonts, textures) are the classic way a 3D scene ends up
    // blank: a blocked CDN suspends the loader forever. Every asset the scene
    // needs must be served by the app itself. Data requests to the Supabase
    // API are expected and not covered by this check.
    const externalAssets = [];
    page.on('request', (request) => {
      const url = request.url();
      if (url.startsWith('blob:') || url.startsWith('data:')) return;
      const { hostname } = new URL(url);
      if (hostname === 'localhost' || hostname === '127.0.0.1') return;
      const type = request.resourceType();
      if (type === 'image' || type === 'font' || type === 'stylesheet' || type === 'media') {
        externalAssets.push(url);
      }
    });

    await page.goto('/');
    await page.locator('button:has-text("ENTER EXPERIENCE")').waitFor({ timeout: 20000 });
    await page.locator('button:has-text("ENTER EXPERIENCE")').click();
    await expect(page.locator('.font-display')).toBeVisible({ timeout: 15000 });

    expect(externalAssets).toEqual([]);
  });

  test('should render Chinese glyphs with the self-hosted display font', async ({ page }) => {
    // The display font is a subset of a 3.3 MB Chinese font, so it is worth
    // guarding that the CJK glyphs really come from it instead of a fallback
    // (or, worse, from a tofu box).
    await page.goto('/');

    const result = await page.evaluate(async () => {
      await document.fonts.ready;
      const sample = '生日快乐';

      const styled = document.createElement('div');
      styled.className = 'font-display';
      styled.style.cssText =
        'position:fixed;top:0;left:0;font-size:48px;color:#fff;visibility:hidden';
      styled.textContent = sample;
      document.body.appendChild(styled);

      const fallback = document.createElement('div');
      fallback.style.cssText =
        'position:fixed;top:0;left:0;font-size:48px;font-family:sans-serif;visibility:hidden';
      fallback.textContent = sample;
      document.body.appendChild(fallback);

      await document.fonts.load('48px "ZCOOL QingKe HuangYou"');

      const styledWidth = styled.getBoundingClientRect().width;
      const fallbackWidth = fallback.getBoundingClientRect().width;
      const fontFamily = getComputedStyle(styled).fontFamily;

      styled.remove();
      fallback.remove();

      return {
        styledWidth,
        fallbackWidth,
        fontFamily,
        loaded: document.fonts.check('48px "ZCOOL QingKe HuangYou"'),
      };
    });

    expect(result.loaded).toBe(true);
    expect(result.fontFamily).toContain('ZCOOL QingKe HuangYou');
    // The glyphs must actually have been laid out by the CJK face: four
    // characters at 48px produce a sane advance width. (The display face is
    // narrower than a full-width system CJK font, so the width is only
    // checked for plausibility, not compared against the fallback.)
    expect(result.styledWidth).toBeGreaterThan(48 * 1.5);
    expect(result.styledWidth).toBeLessThan(48 * 5);
  });

  test('should paint an actual scene, not a blank canvas', async ({ page }) => {
    // A visible <canvas> proves nothing: a blank scene has a canvas too,
    // and so has a scene that renders nothing but a flat background. The
    // only way to catch that is to look at the pixels.
    const canvas = await enterScene(page);
    await expect(canvas).toBeVisible({ timeout: 10000 });
    // Give the intro animation a moment to settle.
    await page.waitForTimeout(1500);

    const shot = await canvas.screenshot();
    const stats = analyseImage(shot);

    expect(stats, 'the screenshot could not be decoded').not.toBeNull();
    // A flat, empty frame has a couple of colours at most.
    expect(stats.distinctColors).toBeGreaterThan(50);
    // ...and no colour variation at all.
    expect(stats.saturatedRatio).toBeGreaterThan(0.01);
    // The background may dominate, but it must not be everything.
    expect(stats.dominantRatio).toBeLessThan(0.98);

    console.log(
      `Scene pixels: ${stats.distinctColors} colours, ` +
      `${(stats.saturatedRatio * 100).toFixed(1)}% saturated, ` +
      `${(stats.dominantRatio * 100).toFixed(1)}% background.`,
    );
  });

  test('should give every scene mode a gallery layout that fits it', async ({ page }) => {
    // The photos hang on the christmas tree in the christmas scene, and
    // they used to keep floating in that empty spiral in the other three
    // scenes, where there is no tree to hang them on.
    await enterScene(page);

    const layoutButton = (layout) =>
      page.locator(`button[aria-pressed]`).filter({ hasText: new RegExp(`^${layout}$`, 'i') });

    await expect(layoutButton('tree')).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: 'Birthday', exact: true }).click();
    await expect(layoutButton('tree')).toHaveAttribute('aria-pressed', 'false');
    await expect(layoutButton('sphere')).toHaveAttribute('aria-pressed', 'true');

    // Back to christmas and the tree layout comes back.
    await page.getByRole('button', { name: 'Christmas', exact: true }).click();
    await expect(layoutButton('tree')).toHaveAttribute('aria-pressed', 'true');
  });

  test('should keep the scene usable when the visitor asks for less motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const canvas = await enterScene(page);
    await expect(canvas).toBeVisible({ timeout: 10000 });
    // The scene still has to render with the motion turned down.
    await expect(page.locator('.font-display')).toBeVisible();
  });

  test('should successfully load the Refine Admin Panel', async ({ page }) => {
    // Navigate to Admin dashboard
    await page.goto(`${ADMIN_URL}/`);

    // Check dashboard loads (Refine has specific panels or login indicators)
    const body = page.locator('body');
    await expect(body).toBeVisible();
    console.log('Admin Panel page rendered successfully.');
  });
});
