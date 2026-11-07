import { expect, test } from '@playwright/test';

const route = '#/experiments/html-in-canvas-lab';

test('DOM fallback: live chart pauses, resumes, changes speed and resets', async ({ page }) => {
  await page.clock.install();
  await page.goto(route);
  await page.getByRole('combobox', { name: '描画方式', exact: true }).selectOption('overlay');
  const demo = page.getByTestId('chart-demo');
  await expect(page.getByTestId('renderer-status')).toContainText('Fallback');
  await expect.poll(async () => Number(await demo.getAttribute('data-updates'))).toBeGreaterThan(0);
  await page.getByRole('button', { name: '一時停止', exact: true }).click();
  const stopped = await demo.getAttribute('data-updates');
  await page.clock.fastForward(2000);
  await expect(demo).toHaveAttribute('data-updates', stopped!);
  await page.getByRole('combobox', { name: '更新間隔', exact: true }).selectOption('100');
  await page.getByRole('combobox', { name: '表示データ', exact: true }).selectOption('180');
  await page.getByRole('button', { name: '再開', exact: true }).click();
  await expect.poll(async () => Number(await demo.getAttribute('data-updates'))).toBeGreaterThan(Number(stopped));
  await page.getByRole('button', { name: '一時停止', exact: true }).click();
  await page.getByRole('button', { name: 'リセット', exact: true }).click();
  await expect(demo).toHaveAttribute('data-updates', '0');
  await expect(page.getByRole('button', { name: 'HTMLごとPNG保存' })).toBeDisabled();
});

test('HTML controls remain interactive through transforms and sample changes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(route);
  await page.getByRole('combobox', { name: '描画方式', exact: true }).selectOption('overlay');
  await page.getByRole('button', { name: /文字と座標変換/ }).click();
  await page.getByRole('textbox', { name: 'カードのタイトル', exact: true }).fill('Canvasでも入力できます');
  await expect(page.getByRole('heading', { name: 'Canvasでも入力できます' })).toBeVisible();
  await page.getByRole('button', { name: 'いいね 0' }).click();
  await expect(page.getByRole('button', { name: 'いいね 1' })).toBeVisible();
  await page.getByRole('button', { name: '正面に戻す' }).click();
  await expect(page.getByRole('slider', { name: '回転 0°', exact: true })).toHaveValue('0');
  await page.getByRole('button', { name: /アニメーションと合成/ }).click();
  await page.getByRole('combobox', { name: '粒子の数', exact: true }).selectOption('72');
  await expect(page.getByText('72 particles', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '動きを止める' }).click();
  await expect(page.getByRole('button', { name: '動きを再開' })).toBeVisible();
  await page.getByRole('link', { name: 'ホームに戻る' }).click();
  await expect(page.getByRole('link', { name: /HTML in Canvas Lab/ })).toBeVisible();
  expect(errors).toEqual([]);
});

for (const width of [360, 768]) {
  test(`responsive and both themes at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(route);
    await page.getByRole('combobox', { name: '描画方式', exact: true }).selectOption('overlay');
    await expect(page.getByRole('button', { name: '一時停止', exact: true })).toBeVisible();
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(await overflow()).toBe(false);
    await page.getByRole('button', { name: 'ダークテーマに切り替え' }).click();
    await expect(page.locator('.hic-lab')).toHaveAttribute('data-theme', 'dark');
    await page.getByRole('button', { name: /文字と座標変換/ }).click();
    await page.getByRole('button', { name: 'いいね 0' }).click();
    await page.getByRole('button', { name: /アニメーションと合成/ }).click();
    await page.getByRole('combobox', { name: '粒子の数', exact: true }).selectOption('18');
    expect(await overflow()).toBe(false);
    await page.getByRole('button', { name: 'ライトテーマに切り替え' }).click();
    await expect(page.locator('.hic-lab')).toHaveAttribute('data-theme', 'light');
  });
}

test('native API: transformed input hit-testing and composited PNG export', async ({ page }) => {
  await page.goto(route);
  const supported = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('content', 'drawable');
    return (canvas as HTMLCanvasElement & { content?: string }).content === 'drawable'
      && 'requestPaint' in canvas && 'drawElementImage' in canvas.getContext('2d')!;
  });
  test.skip(!supported, 'Requires a browser implementing the current HTML-in-Canvas API; no polyfill or native mock.');
  await expect(page.locator('.hic-stage')).toHaveAttribute('data-renderer', 'native');
  await page.getByRole('button', { name: '一時停止', exact: true }).click();
  await expect(page.getByRole('button', { name: '再開', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /文字と座標変換/ }).click();
  await page.getByRole('textbox', { name: 'カードのタイトル', exact: true }).fill('Native Canvas');
  await page.getByRole('button', { name: 'いいね 0' }).click();
  await expect(page.getByRole('button', { name: 'いいね 1' })).toBeVisible();
  await expect(page.locator('.hic-stage')).toHaveAttribute('data-renderer', 'native');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'HTMLごとPNG保存' }).click();
  expect((await download).suggestedFilename()).toBe('html-in-canvas.png');
  await expect(page.getByText('HTMLを含むPNGを保存しました。')).toBeVisible();
});
