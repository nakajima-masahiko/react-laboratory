import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

type Snapshot = Record<string, string | number | boolean | null>;
const resultsDirectory = resolve('validation-artifacts/results');

async function metric(page: Page, slug: string) {
  return (await page.getByTestId(`metric-${slug}`).locator('strong').textContent())?.trim() ?? '';
}

async function snapshot(page: Page, extra: Snapshot = {}): Promise<Snapshot> {
  const mode = await page.getByLabel('Mode').inputValue();
  const density = await metric(page, 'candles-css-px');
  return {
    datasetSize: await metric(page, 'dataset-size'),
    renderingMode: mode,
    effectiveVisibleRangeStart: await metric(page, 'range-start'),
    effectiveVisibleRangeEnd: await metric(page, 'range-end'),
    approximateVisibleCanonicalCount: await metric(page, 'approx-visible-bars'),
    plotCssWidth: await metric(page, 'plot-css-width'),
    candlesPerCssPixel: density,
    derivedLodActive: mode === 'experimental-full-range' && Number.parseFloat(density) > 10,
    fps: await metric(page, 'fps-live'),
    fpsMinAverage: await metric(page, 'fps-min-avg'),
    setDataDuration: await metric(page, 'setdata-duration'),
    chartRecreation: await metric(page, 'chart-recreation'),
    ...extra,
  };
}

async function record(testInfo: TestInfo, scenario: string, status: 'passed' | 'failed', observations: Snapshot[]) {
  await mkdir(resultsDirectory, { recursive: true });
  await writeFile(resolve(resultsDirectory, `${scenario}.json`), `${JSON.stringify({ scenario, status, observations }, null, 2)}\n`);
  await testInfo.attach(`${scenario}-results`, { body: JSON.stringify(observations, null, 2), contentType: 'application/json' });
}

async function openLab(page: Page) {
  await page.goto('#/experiments/candle-core-lab');
  await expect(page.getByRole('heading', { name: 'CandleCore Lab' })).toBeVisible();
  await expect(page.getByLabel('Mode')).toHaveValue('bounded');
  await expect(page.getByRole('button', { name: 'I · 1M Full Range LOD' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Inspect', exact: true })).toBeVisible();
}

async function runScenario(page: Page, buttonName: string, expectedSize: string) {
  await page.getByRole('button', { name: buttonName, exact: true }).click();
  await expect(page.getByRole('status')).toBeHidden({ timeout: 150_000 });
  await expect(page.getByTestId('metric-dataset-size').locator('strong')).toHaveText(expectedSize);
}

async function showFullHistory(page: Page) {
  await page.getByRole('button', { name: 'Fit / show full history' }).click();
  await expect.poll(() => metric(page, 'approx-visible-bars')).not.toBe('—');
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await openLab(page);
  (page as Page & { __browserErrors?: string[] }).__browserErrors = errors;
});

test.afterEach(async ({ page }, testInfo) => {
  const errors = (page as Page & { __browserErrors?: string[] }).__browserErrors ?? [];
  await testInfo.attach('browser-errors', { body: JSON.stringify(errors, null, 2), contentType: 'application/json' });
  expect(errors, 'browser console/page errors').toEqual([]);
});

test('Scenario H — 100k bounded versus experimental lifecycle', async ({ page }, testInfo) => {
  const observations: Snapshot[] = [];
  try {
    await runScenario(page, 'H · 100k comparison', '100k');
    const initialCanvasCount = await page.locator('.ccl-chart canvas').count();
    expect(initialCanvasCount).toBeGreaterThan(0);
    await showFullHistory(page);
    observations.push(await snapshot(page, { phase: 'bounded-full-request' }));
    expect(Number.parseInt(String(observations.at(-1)?.approximateVisibleCanonicalCount).replace(/,/g, ''), 10)).toBeLessThan(100_000);

    await page.getByLabel('Mode').selectOption('experimental-full-range');
    await showFullHistory(page);
    await expect.poll(async () => Number.parseInt((await metric(page, 'approx-visible-bars')).replace(/,/g, ''), 10)).toBeGreaterThanOrEqual(99_999);
    observations.push(await snapshot(page, { phase: 'experimental-full-history' }));

    for (let cycle = 0; cycle < 2; cycle += 1) {
      await page.getByLabel('Mode').selectOption('bounded');
      await page.getByLabel('Mode').selectOption('experimental-full-range');
    }
    await page.getByLabel('Mode').selectOption('bounded');
    await showFullHistory(page);
    observations.push(await snapshot(page, { phase: 'bounded-restored' }));
    await expect(page.locator('.ccl-chart canvas')).toHaveCount(initialCanvasCount);
    await page.screenshot({ path: 'validation-artifacts/scenario-h.png', fullPage: true });
    await record(testInfo, 'scenario-h', 'passed', observations);
  } catch (error) {
    await record(testInfo, 'scenario-h', 'failed', observations);
    throw error;
  }
});

test('Scenario I — 1M pan, zoom, transition, resize, and stability', async ({ page }, testInfo) => {
  const observations: Snapshot[] = [];
  try {
    await runScenario(page, 'I · 1M Full Range LOD', '1M');
    await showFullHistory(page);
    await expect.poll(async () => Number.parseInt((await metric(page, 'approx-visible-bars')).replace(/,/g, ''), 10)).toBeGreaterThanOrEqual(999_999);
    observations.push(await snapshot(page, { phase: 'full-history' }));
    for (let index = 0; index < 3; index += 1) {
      await page.getByRole('button', { name: 'Scroll left' }).click();
      await page.getByRole('button', { name: 'Scroll right' }).click();
    }
    await page.getByRole('button', { name: 'Last 10% (typical zoom)' }).click();
    for (let index = 0; index < 5; index += 1) await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
    observations.push(await snapshot(page, { phase: 'direct-density-candidate' }));
    await showFullHistory(page);
    await page.setViewportSize({ width: 1024, height: 800 });
    await expect.poll(() => metric(page, 'plot-css-width')).not.toBe(String(observations[0].plotCssWidth));
    observations.push(await snapshot(page, { phase: 'resized-lod' }));
    await page.screenshot({ path: 'validation-artifacts/scenario-i.png', fullPage: true });
    await record(testInfo, 'scenario-i', 'passed', observations);
  } catch (error) {
    await record(testInfo, 'scenario-i', 'failed', observations);
    throw error;
  }
});

test('Scenarios J–K — Navigator read-back and Inspect lifecycle', async ({ page }, testInfo) => {
  const observations: Snapshot[] = [];
  try {
    await runScenario(page, 'J · Navigator + Full Range', '100k');
    await showFullHistory(page);
    const chart = page.locator('.ccl-chart');
    const box = await chart.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      const y = box.y + box.height - 30;
      await page.mouse.move(box.x + box.width * 0.25, y);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.45, y, { steps: 10 });
      await page.mouse.up();
    }
    observations.push(await snapshot(page, { phase: 'navigator-drag-readback' }));
    await page.getByLabel('Height').fill('96');
    await expect(page.getByLabel('Height')).toHaveValue('96');

    await runScenario(page, 'K · Inspect + Full Range', '100k');
    await showFullHistory(page);
    await expect(page.getByRole('button', { name: 'Inspect', exact: true })).toHaveAttribute('aria-pressed', 'true');
    const inspectBox = await chart.boundingBox();
    if (inspectBox) {
      const y = inspectBox.y + inspectBox.height * 0.4;
      await page.mouse.move(inspectBox.x + inspectBox.width * 0.35, y);
      await page.mouse.down();
      await page.mouse.move(inspectBox.x + inspectBox.width * 0.65, y, { steps: 12 });
      await page.mouse.up();
    }
    observations.push(await snapshot(page, { phase: 'inspect-high-density', canonicalIdentity: 'human-visual-check-required' }));
    await page.getByRole('button', { name: 'Last 10% (typical zoom)' }).click();
    for (let index = 0; index < 5; index += 1) await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
    await page.getByRole('button', { name: 'Pan', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Pan', exact: true })).toHaveAttribute('aria-pressed', 'true');
    observations.push(await snapshot(page, { phase: 'inspect-to-direct-to-pan' }));
    await page.screenshot({ path: 'validation-artifacts/scenario-j-k.png', fullPage: true });
    await record(testInfo, 'scenario-j-k', 'passed', observations);
  } catch (error) {
    await record(testInfo, 'scenario-j-k', 'failed', observations);
    throw error;
  }
});

test('Scenario L — existing series stress matrix remains operable', async ({ page }, testInfo) => {
  const observations: Snapshot[] = [];
  try {
    await runScenario(page, 'L · Series matrix', '100k');
    await showFullHistory(page);
    for (const preset of ['Base only', 'Trend', 'Momentum', 'All visible']) {
      await page.getByRole('button', { name: preset, exact: true }).click();
      observations.push(await snapshot(page, { preset }));
    }
    await page.getByRole('button', { name: 'Bid/Ask', exact: true }).click();
    observations.push(await snapshot(page, { preset: 'Bid/Ask toggled' }));
    await page.getByRole('button', { name: 'Scroll left' }).click();
    await page.getByRole('button', { name: 'Zoom out', exact: true }).click();
    await page.screenshot({ path: 'validation-artifacts/scenario-l.png', fullPage: true });
    await record(testInfo, 'scenario-l', 'passed', observations);
  } catch (error) {
    await record(testInfo, 'scenario-l', 'failed', observations);
    throw error;
  }
});
