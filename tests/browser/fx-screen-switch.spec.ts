import { expect, test } from '@playwright/test';

const route = '#/experiments/fx-screen-switch-lab';

for (const viewport of [{ width: 1280, height: 1000 }, { width: 390, height: 844 }]) {
  test(`iframe state, main-to-child controls and live feed at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(route);
    await expect(page.getByRole('status')).toContainText('接続済み 4/4');
    const main = page.frameLocator('iframe[title="メイン画面"]');
    const child = page.frameLocator('iframe[title="チャート1"]');
    const mainId = await main.locator('[data-instance]').getAttribute('data-instance');
    const childId = await child.locator('[data-instance]').getAttribute('data-instance');
    await main.getByRole('button', { name: '子画面の設定', exact: true }).click();
    await main.getByLabel('チャート1 通貨ペア', { exact: true }).selectOption('GBP/JPY');
    await main.getByLabel('チャート1 時間足', { exact: true }).selectOption('5');
    await main.getByLabel('チャート1 表示本数', { exact: true }).selectOption('240');
    await page.getByRole('tab', { name: /GBP\/JPY/ }).click();
    await expect(child.getByLabel('チャート 1 通貨ペア', { exact: true })).toHaveValue('GBP/JPY');
    await expect(child.getByLabel('チャート 1 時間足', { exact: true })).toHaveValue('5');
    await expect(child.getByLabel('チャート 1 表示本数', { exact: true })).toHaveValue('240');
    await expect(child.locator('.fx-chart canvas')).toBeVisible();
    const chartId = await child.locator('.fx-chart').getAttribute('_echarts_instance_');
    const initialTicks = Number(await child.getByTestId('received-ticks').textContent());
    await expect.poll(async () => Number(await child.getByTestId('received-ticks').textContent())).toBeGreaterThan(initialTicks);
    await child.getByLabel('チャート 1 通貨ペア', { exact: true }).selectOption('EUR/USD');
    await page.getByRole('tab', { name: 'メイン画面', exact: false }).click();
    await expect(main.getByLabel('チャート1 通貨ペア', { exact: true })).toHaveValue('EUR/USD');
    await expect(main.locator('[data-instance]')).toHaveAttribute('data-instance', mainId!);
    // Main navigation does not recreate siblings, even a full main-iframe reload.
    await page.getByRole('button', { name: '一時停止', exact: true }).click();
    await page.locator('iframe[title="メイン画面"]').evaluate((element: HTMLIFrameElement) => element.contentWindow!.location.reload());
    await expect(main.getByRole('heading', { name: 'メイン画面', exact: true })).toBeVisible();
    await page.getByRole('tab', { name: /EUR\/USD.*5分足/ }).click();
    await expect(child.locator('[data-instance]')).toHaveAttribute('data-instance', childId!);
    await expect(child.locator('.fx-chart')).toHaveAttribute('_echarts_instance_', chartId!);
    await expect(child.getByLabel('チャート 1 表示本数', { exact: true })).toHaveValue('240');
    await page.getByRole('button', { name: 'ライト表示', exact: true }).click();
    await expect(child.locator('main')).toHaveAttribute('data-theme', 'light');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('tab', { name: 'メイン画面', exact: false }).click();
    await expect(page.locator('#fx-pane-main')).toHaveCSS('transition-duration', '0s');
    await expect(page.locator('#fx-pane-main')).toHaveCSS('transform', 'none');
    await expect(page.locator('.fx-tab-indicator')).toHaveCSS('transition-duration', '0s');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await main.locator('body').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    expect(errors).toEqual([]);
    await page.screenshot({ path: `validation-artifacts/fx-screen-switch-${viewport.width}.png`, fullPage: true });
  });
}

test('rapid switching, keyboard navigation and unrelated messages keep the host consistent', async ({ page }) => {
  await page.goto(route);
  await expect(page.getByRole('status')).toContainText('接続済み 4/4');
  await page.evaluate(() => {
    const tabs = document.querySelectorAll<HTMLButtonElement>('.fx-tabbar button');
    for (const index of [3, 1, 2, 0, 3, 1]) tabs[index].click();
    // A same-origin message without a registered child Window must be ignored.
    const session = new URLSearchParams(document.querySelector('iframe')!.src.split('?')[1]).get('session');
    window.postMessage({ channel: 'fx-screen-switch-v1', session, screen: 'main', type: 'navigate', target: 'chart-3' }, location.origin);
  });
  const tab = page.getByRole('tab', { name: /USD\/JPY.*5分足/ });
  await expect(tab).toHaveAttribute('aria-selected', 'true');
  await tab.focus();
  await tab.press('End');
  await expect(page.getByRole('tab', { name: /EUR\/USD/ })).toBeFocused();
  await page.keyboard.press('Home');
  await expect(page.getByRole('tab', { name: 'メイン画面', exact: false })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('iframe')).toHaveCount(4);
});

test('short movement and fade stay bounded; selection indicator follows the destination', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(route);
  await expect(page.getByRole('status')).toContainText('接続済み 4/4');
  // Pause browser animations at a known point instead of waiting on wall-clock timing.
  const halfway = await page.evaluate(async () => {
    const oldPane = document.getElementById('fx-pane-main')!;
    const nextPane = document.getElementById('fx-pane-chart-1')!;
    const indicator = document.querySelector<HTMLElement>('.fx-tab-indicator')!;
    oldPane.getBoundingClientRect();
    document.getElementById('fx-tab-chart-1')!.click();
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const animations = [oldPane, nextPane, indicator].flatMap(element => element.getAnimations());
    for (const animation of animations) { animation.pause(); animation.currentTime = 100; }
    const inspect = (element: HTMLElement) => {
      const style = getComputedStyle(element);
      return { opacity: Number(style.opacity), x: new DOMMatrixReadOnly(style.transform).m41 };
    };
    return { count: animations.length, old: inspect(oldPane), next: inspect(nextPane) };
  });
  expect(halfway.count).toBeGreaterThanOrEqual(5);
  expect(halfway.old.opacity).toBeGreaterThan(0);
  expect(halfway.old.opacity).toBeLessThan(1);
  expect(halfway.next.opacity).toBeGreaterThan(0);
  expect(halfway.next.opacity).toBeLessThan(1);
  expect(halfway.old.x).toBeLessThan(0);
  expect(halfway.next.x).toBeGreaterThan(0);
  expect(Math.abs(halfway.old.x)).toBeLessThanOrEqual(24);
  expect(Math.abs(halfway.next.x)).toBeLessThanOrEqual(24);
  await page.evaluate(() => {
    for (const element of document.querySelectorAll('.fx-screen-panel, .fx-tab-indicator')) {
      for (const animation of element.getAnimations()) animation.finish();
    }
  });
  await expect(page.locator('#fx-pane-chart-1')).toHaveCSS('opacity', '1');
  await expect(page.locator('#fx-pane-main')).toHaveCSS('opacity', '0');
  await expect(page.locator('#fx-pane-main')).toHaveAttribute('inert', '');
  const aligned = await page.locator('.fx-tab-indicator').evaluate(element => {
    const tab = document.getElementById('fx-tab-chart-1')!;
    return Math.abs(element.getBoundingClientRect().left - tab.getBoundingClientRect().left) < 1;
  });
  expect(aligned).toBe(true);
});
