import { expect, test } from '@playwright/test';

test.use({ launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } });

for (const variant of [
  { width: 1280, height: 960, colorScheme: 'light' as const },
  { width: 320, height: 740, colorScheme: 'dark' as const },
]) {
  test.describe(`${variant.width}px ${variant.colorScheme}`, () => {
    test.use({ viewport: variant, colorScheme: variant.colorScheme, reducedMotion: 'reduce' });
    test('welcome, room selection, route correction, arrival and editing a stay', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('#/experiments/shiro-yado');
      await expect(page.getByRole('heading', { name: 'ようこそ、島のひと休みへ。' })).toBeVisible();
      await expect(page.getByTestId('concierge-model')).toHaveAttribute('data-phase', 'idle');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.screenshot({ path: test.info().outputPath('welcome.png'), fullPage: true });
      await page.getByRole('button', { name: /お部屋でゆっくり/ }).click();
      await page.getByRole('button', { name: /204 コーナーツイン/ }).click();
      const start = page.getByRole('button', { name: '案内を始める', exact: true });
      await expect(start).toBeEnabled();
      expect(await start.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
      await start.click();
      await page.getByRole('combobox', { name: '案内の出発地点' }).selectOption('room-201');
      await page.getByRole('button', { name: 'お部屋', exact: true }).click();
      await expect(page.getByRole('combobox', { name: '案内の出発地点' })).toHaveValue('room-201');
      const steps = page.getByRole('list').filter({ hasText: 'エレベーターホールから右手' });
      await expect(steps).toContainText('204 コーナーツイン');
      await expect(steps).not.toContainText('2階で降り');
      await page.getByRole('button', { name: /到着した/ }).click();
      await expect(page.getByRole('combobox', { name: '案内の出発地点' })).toHaveValue('room-204');
      await page.getByRole('button', { name: 'ホーム', exact: true }).click();
      await expect(page.getByTestId('concierge-model')).toHaveAttribute('data-phase', 'idle');
      await page.getByRole('button', { name: '部屋を変更する', exact: true }).click();
      await page.getByRole('button', { name: /設定を解除/ }).click();
      await expect(start).toBeDisabled();
      expect(errors).toEqual([]);
    });

    test('map pins and list work without autoplay and follow the selected language', async ({ page }) => {
      await page.goto('#/experiments/shiro-yado/tourism');
      await page.getByRole('button', { name: '2. 月守灯台', exact: true }).click();
      await expect(page.getByRole('heading', { name: '月守灯台', exact: true })).toBeFocused();
      await expect(page.getByTestId('concierge-model')).toHaveAttribute('data-phase', 'idle');
      await expect(page.getByRole('button', { name: '2. 月守灯台', exact: true })).toHaveAttribute('aria-pressed', 'true');
      await page.getByRole('combobox', { name: '言語', exact: true }).selectOption('fr');
      await expect(page.getByRole('heading', { name: 'Phare de Tsukimori', exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.getByRole('button', { name: 'Accueil', exact: true }).click();
      await page.getByRole('button', { name: /Se détendre aux bains/ }).click();
      await expect(page.getByRole('heading', { name: 'Bains · Shiromiyu', exact: true })).toBeVisible();
      await expect(page.getByText(/Un bain de granit blanc/)).toBeVisible();
    });
  });
}
