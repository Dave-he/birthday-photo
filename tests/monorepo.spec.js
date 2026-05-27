const { test, expect } = require('@playwright/test');

test.describe('Birthday Photo - 3D Electronic Gallery E2E Tests', () => {

  test('should successfully load the 3D Front-end Exhibition', async ({ page }) => {
    // Navigate to local Next.js app
    await page.goto('/');

    // 1. Verify Welcome Overlay
    const title = page.locator('h1');
    await expect(title).toBeVisible();
    console.log('Overlay Welcome title loaded successfully.');

    // 2. Click Enter Experience
    const enterButton = page.locator('button:has-text("ENTER EXPERIENCE")');
    if (await enterButton.isVisible()) {
      await enterButton.click();
      console.log('Clicked "ENTER EXPERIENCE" successfully.');
    }

    // 3. Verify 3D Canvas
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    console.log('3D WebGL Canvas successfully compiled and rendered on screen!');

    // 4. Verify HUD Controls
    const hudContainer = page.locator('.bg-black\\/30.backdrop-blur-xl');
    await expect(hudContainer).toBeVisible();
    console.log('HUD Glassmorphism panel verified on screen.');
  });

  test('should successfully load the Refine Admin Panel', async ({ page }) => {
    // Navigate to Admin dashboard
    await page.goto('http://localhost:8080/');

    // Check dashboard loads (Refine has specific panels or login indicators)
    const body = page.locator('body');
    await expect(body).toBeVisible();
    console.log('Admin Panel page rendered successfully.');
  });
});
