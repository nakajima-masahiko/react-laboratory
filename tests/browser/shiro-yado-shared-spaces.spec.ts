import { expect, test } from '@playwright/test';

test.use({ launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }, reducedMotion: 'reduce' });
for (const width of [320, 1280]) {
  test(`shared spaces use images before optional 3D at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: width === 320 ? 'dark' : 'light' });
    await page.goto('#/experiments/shiro-yado/floor/3');
    const floor = page.getByTestId('third-floor-page');
    await expect(floor.getByRole('img', { name: /窓辺の椅子とお茶/ })).toBeVisible();
    await expect(floor.locator('canvas')).toHaveCount(0);
    const hall = floor.getByRole('article', { name: '宴会場 白の間', exact: true });
    await hall.getByRole('button', { name: '詳しく見る', exact: true }).click();
    await expect(page).toHaveURL(/place\/banquet$/);
    await expect(page.getByRole('img', { name: /白い器を並べた淡い木のテーブル/ })).toBeVisible();
    await expect(page.locator('.shiro-yado__body canvas')).toHaveCount(0);
    await expect(page.getByRole('group').filter({ has: page.getByText('白の間を3Dで見る', { exact: true }) })).not.toHaveAttribute('open');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole('region', { name: '白の宿のお食事', exact: true }).getByRole('button', { name: 'お食事を楽しむ' }).click();
    await expect(page.getByTestId('dining-page')).toBeVisible();
  });
}
