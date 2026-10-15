import { expect, test } from '@playwright/test';

declare global { interface Window { innerPageSpeech: { calls: string[]; cancels: number } } }
test.use({ launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } });
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.innerPageSpeech = { calls: [], cancels: 0 };
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: class { text: string; constructor(text: string) { this.text = text; } } });
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      cancel() { window.innerPageSpeech.cancels++; }, getVoices() { return []; },
      speak(utterance: SpeechSynthesisUtterance) {
        window.innerPageSpeech.calls.push(utterance.text);
        queueMicrotask(() => utterance.onstart?.({} as SpeechSynthesisEvent));
      },
    } });
  });
});
for (const variant of [
  { width: 1280, height: 960, colorScheme: 'light' as const },
  { width: 320, height: 740, colorScheme: 'dark' as const },
]) {
  test.describe(`${variant.width}px ${variant.colorScheme}`, () => {
    test.use({ viewport: variant, colorScheme: variant.colorScheme });
    test('route is readable before 3D and speech follows the chosen origin', async ({ page }) => {
      await page.goto('#/experiments/shiro-yado/guide/bath');
      const route = page.getByTestId('route-page');
      await expect(route.getByRole('heading', { name: 'こちらの順にお進みください' })).toBeVisible();
      await expect(route.getByRole('list')).toContainText('ロビー奥のエレベーターホール');
      await expect(route.locator('canvas')).toHaveCount(0);
      expect(await page.evaluate(() => window.innerPageSpeech.calls)).toEqual([]);
      await route.getByRole('button', { name: 'この行き方を音声で聞く' }).click();
      await expect.poll(() => page.evaluate(() => window.innerPageSpeech.calls.length)).toBe(1);
      expect((await page.evaluate(() => window.innerPageSpeech.calls))[0]).toContain('ロビー奥');
      await route.locator('summary').filter({ hasText: '案内の出発地点' }).click();
      await route.getByRole('combobox').selectOption('banquet');
      await expect(route.getByRole('list')).not.toContainText('3階のボタン');
      await expect(route.getByRole('button', { name: '音声を止める' })).toHaveCount(0);
      await route.getByRole('button', { name: '到着したので現在地を更新' }).click();
      await expect(route.getByRole('button', { name: 'この行き方を音声で聞く' })).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
    test('bath keeps practical information above imagery and translates its content', async ({ page }) => {
      await page.goto('#/experiments/shiro-yado/place/bath');
      const bath = page.getByTestId('bath-page');
      await expect(bath.getByRole('heading', { name: '浴場 しろみゆ' })).toBeVisible();
      await expect(bath.getByText('15:00–24:00 / 6:00–10:00')).toBeVisible();
      const action = await bath.getByRole('button', { name: 'ここへの行き方' }).boundingBox();
      const mural = await bath.getByRole('img', { name: '富士山と松の壁画' }).boundingBox();
      expect(action!.y + action!.height).toBeLessThanOrEqual(mural!.y);
      await expect(bath.locator('canvas')).toHaveCount(0);
      expect(await page.evaluate(() => getComputedStyle(document.querySelector('.shiro-yado')!).backgroundColor)).toBe('rgb(255, 255, 255)');
      await page.getByRole('combobox', { name: '言語' }).selectOption('fr');
      await expect(bath.getByRole('heading', { name: 'Profiter de Shiromiyu' })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  });
}
