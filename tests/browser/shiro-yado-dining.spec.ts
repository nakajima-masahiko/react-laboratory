import { expect, test } from '@playwright/test';

test.use({ launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }, reducedMotion: 'reduce' });
for (const width of [320, 1280]) {
  test(`dining is reachable, readable and connected to White Hall at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: width === 320 ? 'dark' : 'light' });
    await page.goto('#/experiments/shiro-yado');
    await page.getByRole('region', { name: '白の宿のお食事', exact: true }).getByRole('button', { name: 'お食事を楽しむ' }).click();
    const dining = page.getByTestId('dining-page');
    await expect(dining).toBeVisible();
    await expect(dining.getByText(/現在の体験用客室予約に食事は含まれません/)).toBeVisible();
    await dining.getByRole('button', { name: '白の間の夕ごはん', exact: true }).click();
    await expect(dining.getByRole('heading', { name: '白の間の夕ごはん', exact: true })).toBeFocused();
    await expect(page).toHaveURL(/shiro-yado\/dining$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await dining.getByRole('button', { name: '白の間への行き方', exact: true }).first().click();
    await expect(page).toHaveURL(/guide\/banquet$/);
    await page.goto('#/experiments/shiro-yado/place/banquet');
    await page.getByRole('region', { name: '白の宿のお食事', exact: true }).getByRole('button', { name: 'お食事を楽しむ' }).click();
    await expect(dining).toBeVisible();
  });
}
test('concierge dining menu and French copy open the same dining page', async ({ page }) => {
  await page.goto('#/experiments/shiro-yado');
  await page.getByLabel('言語', { exact: true }).selectOption('fr');
  await page.getByRole('button', { name: /À table à Shiro Yado Lieu/ }).click();
  await page.getByRole('button', { name: 'Découvrir les repas', exact: true }).first().click();
  await expect(page.getByTestId('dining-page').getByRole('heading', { name: 'À table à Shiro Yado', exact: true })).toBeVisible();
});
