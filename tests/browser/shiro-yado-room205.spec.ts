import { expect, test } from '@playwright/test';

for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
  test(`room 205 supports inside and overview perspectives at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('#/experiments/shiro-yado/place/room-205');
    const stage = page.locator('.shiro-yado__stage[data-scene="room-205"]');
    const switcher = stage.getByRole('group', { name: '205号室の視点' });
    const inside = switcher.getByRole('button', { name: '室内から見る' });
    const overview = switcher.getByRole('button', { name: '全体を見る' });
    await expect(inside).toHaveAttribute('aria-pressed', 'true');
    await overview.click();
    await expect(overview).toHaveAttribute('aria-pressed', 'true');
    await inside.click();
    await expect(inside).toHaveAttribute('aria-pressed', 'true');
    await expect(stage.locator('canvas')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('room 205 camera UI stays translated into English', async ({ page }) => {
  await page.goto('#/experiments/shiro-yado/place/room-205');
  await page.getByRole('combobox', { name: '言語' }).selectOption('en');
  const stage = page.locator('.shiro-yado__stage[data-scene="room-205"]');
  await expect(stage.getByRole('group', { name: 'Room 205 camera view' })).toBeVisible();
  await stage.getByRole('button', { name: 'Overview' }).click();
  await expect(stage.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-pressed', 'true');
});
