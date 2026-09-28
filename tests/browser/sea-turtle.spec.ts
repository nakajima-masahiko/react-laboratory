import { expect, test } from '@playwright/test';

for (const width of [1280, 390]) {
  test(`sea turtle observation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('#/experiments/sea-turtle');
    await expect(page.getByTestId('sea-turtle').locator('canvas')).toBeVisible();
    await page.getByRole('button', { name: '操作案内を閉じる' }).click();
    await page.getByRole('button', { name: '追跡', exact: true }).click();
    await expect(page.getByRole('button', { name: '追跡', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: '接近観察', exact: true }).click();
    await page.getByLabel('観察する部位').selectOption('腹甲');
    await expect(page.getByRole('heading', { name: '腹甲', exact: true })).toBeVisible();
    await page.getByRole('button', { name: '生態情報を閉じる' }).click();
    await page.getByRole('button', { name: '呼吸を観察', exact: true }).click();
    await page.getByRole('button', { name: '一時停止', exact: true }).click();
    await expect(page.getByRole('button', { name: '再生', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: '軽量表示', exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}
