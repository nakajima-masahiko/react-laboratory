import { expect, test } from '@playwright/test';

for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
  test(`room 204 offers immersive and overview cameras at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('#/experiments/shiro-yado/place/room-204');
    const stage = page.locator('.shiro-yado__stage[data-scene="room-204"]');
    const cameraSwitch = stage.getByRole('group', { name: '204号室の視点' });
    const inside = cameraSwitch.getByRole('button', { name: '室内から見る' });
    const overview = cameraSwitch.getByRole('button', { name: '全体を見る' });
    await expect(inside).toHaveAttribute('aria-pressed', 'true');
    await expect(overview).toHaveAttribute('aria-pressed', 'false');

    await overview.click();
    await expect(overview).toHaveAttribute('aria-pressed', 'true');
    await inside.click();
    await expect(inside).toHaveAttribute('aria-pressed', 'true');

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('room 204 retains localized camera controls in English', async ({ page }) => {
  await page.goto('#/experiments/shiro-yado/place/room-204');
  await page.getByRole('combobox', { name: '言語' }).selectOption('en');
  const stage = page.locator('.shiro-yado__stage[data-scene="room-204"]');
  await expect(stage.getByRole('button', { name: 'Inside view' })).toBeVisible();
  await stage.getByRole('button', { name: 'Overview' }).click();
  await expect(stage.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-pressed', 'true');
});
