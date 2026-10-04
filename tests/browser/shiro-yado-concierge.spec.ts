import { expect, test } from '@playwright/test';

// Test voices report explicit start/end events; no device voice or audio is needed.
test.beforeEach(async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => {
    class Utterance { text: string; constructor(text: string) { this.text = text; } }
    const voice = {
      calls: [] as SpeechSynthesisUtterance[], current: null as SpeechSynthesisUtterance | null,
      cancel() { this.current = null; }, getVoices() { return []; },
      speak(utterance: SpeechSynthesisUtterance) {
        this.calls.push(utterance); this.current = utterance;
        queueMicrotask(() => { if (this.current === utterance) utterance.onstart?.({} as SpeechSynthesisEvent); });
      },
      finish() { const utterance = this.current; this.current = null; utterance?.onend?.({} as SpeechSynthesisEvent); },
    };
    Object.defineProperty(window, 'speechSynthesis', { value: voice, configurable: true });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: Utterance, configurable: true });
    Object.assign(window, { conciergeTestVoice: voice });
  });
});

declare global {
  interface Window {
    conciergeTestVoice: {
      calls: SpeechSynthesisUtterance[];
      current: SpeechSynthesisUtterance | null;
      finish: () => void;
    };
  }
}

test.use({ launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } });

for (const variant of [
  { name: 'desktop light', width: 1280, height: 960, colorScheme: 'light' as const },
  { name: 'mobile dark', width: 390, height: 844, colorScheme: 'dark' as const },
]) {
  test(`${variant.name}: bow, speech, farewell, fixed camera and stop/replay`, async ({ page }) => {
    await page.setViewportSize(variant);
    await page.emulateMedia({ colorScheme: variant.colorScheme });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('#/experiments/shiro-yado');
    const model = page.getByTestId('concierge-model');
    await expect(model).toHaveAttribute('data-model', 'ready');
    await expect(model).toHaveAttribute('data-phase', 'bowing');
    expect(await page.evaluate(() => window.conciergeTestVoice.calls.length)).toBe(0);
    await expect(model).toHaveAttribute('data-phase', 'speaking');
    await page.evaluate(() => window.conciergeTestVoice.finish());
    await expect(model).toHaveAttribute('data-phase', 'finished');
    // Advance the expression without waiting on wall-clock animation timing.
    await page.clock.runFor(2100);
    await model.scrollIntoViewIfNeeded();
    const canvas = model.locator('canvas');
    await expect(canvas).toHaveCSS('pointer-events', 'none');
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + box!.width * 0.4, box!.y + box!.height * 0.35);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width * 0.7, box!.y + box!.height * 0.5, { steps: 8 });
    await page.mouse.up();
    await expect(model).toHaveAttribute('data-phase', 'finished');
    await expect(model).toHaveCSS('pointer-events', 'none');
    await page.getByRole('button', { name: 'もう一度聞く', exact: true }).click();
    await expect(model).toHaveAttribute('data-phase', 'speaking');
    await page.getByRole('button', { name: '停止', exact: true }).click();
    await expect(model).toHaveAttribute('data-phase', 'idle');
    await page.getByRole('button', { name: '表示を写真に切り替え', exact: true }).click();
    await expect(model).toHaveAttribute('data-model', 'photo');
    await page.getByRole('button', { name: '表示を3Dに切り替え', exact: true }).click();
    await expect(model).toHaveAttribute('data-model', 'ready');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('a failed model request falls back to the photo and releases the greeting', async ({ page }) => {
  await page.route('**/models/shiro-yado/hotel-concierge.glb', (route) => route.abort());
  await page.goto('#/experiments/shiro-yado');
  const model = page.getByTestId('concierge-model');
  await expect(model).toHaveAttribute('data-model', 'photo');
  await expect(model).toHaveAttribute('data-phase', 'speaking');
  await expect(page.getByRole('img', { name: '白の宿のコンシェルジュ', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '停止', exact: true }).click();
  await expect(model).toHaveAttribute('data-phase', 'idle');
});
