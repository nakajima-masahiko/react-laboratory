/** Record the real UI. Requires Playwright + Chromium; see README. */
import { createRequire } from 'node:module';
import { mkdir, writeFile, rm, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.DEMO_BASE_URL || 'http://127.0.0.1:5173/react-laboratory/';
const date = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
const output = resolve(process.env.DEMO_OUTPUT_DIR || `artifacts/demos/${date}`);
const viewport = { width: 1280, height: 900 };
const ids = process.argv.slice(2);
const selected = ids.length ? ids : ['sea-turtle', 'kart-rush', 'shiro-yado'];
assert(selected.every(id => ['sea-turtle', 'kart-rush', 'shiro-yado'].includes(id)), 'Unknown experiment');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const pause = (page, ms) => page.waitForTimeout(ms); // Presentation time only, never a readiness check.
const visible = locator => locator.waitFor({ state: 'visible', timeout: 45000 });

try {
  for (const id of selected) {
    const destination = join(output, `${id}.webm`);
    if (await stat(destination).then(() => true, () => false)) throw new Error(`Refusing to overwrite ${destination}`);
    const temp = join(output, `.raw-${id}`);
    const context = await browser.newContext({ viewport, locale: 'ja-JP', deviceScaleFactor: 1, recordVideo: { dir: temp, size: viewport } });
    const page = await context.newPage();
    const errors = [], warnings = [], failedRequests = [], checks = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
      if (message.type() === 'warning') warnings.push(message.text());
    });
    page.on('requestfailed', request => failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText}`));
    const url = `${base.replace(/\/$/, '')}/#/experiments/${id}`;
    let failure;
    const video = page.video();
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await visible(page.locator('canvas').first());
      await page.evaluate(() => document.fonts.ready);
      if (id === 'sea-turtle') {
        await page.getByRole('status').waitFor({ state: 'hidden' });
        await page.getByRole('button', { name: '操作案内を閉じる' }).click();
        checks.push('3D canvas visible and loading status cleared');
        await pause(page, 5000);
        await page.screenshot({ path: join(output, `${id}.png`) });
        await page.getByRole('button', { name: '追跡', exact: true }).click();
        assert.equal(await page.getByRole('button', { name: '追跡', exact: true }).getAttribute('aria-pressed'), 'true');
        checks.push('Tracking view selected');
        await pause(page, 6000);
        await page.getByRole('button', { name: '接近観察', exact: true }).click();
        await visible(page.getByRole('complementary', { name: '生態情報' }));
        await page.getByRole('combobox').selectOption({ label: '前ヒレ' });
        await visible(page.getByRole('heading', { name: '前ヒレ', exact: true }));
        checks.push('Close observation and front-flipper information displayed');
        await pause(page, 6000);
        await page.getByRole('button', { name: '生態情報を閉じる' }).click();
        await page.getByRole('button', { name: '呼吸を観察', exact: true }).click();
        await pause(page, 8000);
        await page.getByRole('button', { name: '一時停止', exact: true }).click();
        assert.equal(await page.getByRole('button', { name: '再生', exact: true }).getAttribute('aria-pressed'), 'true');
        checks.push('Pause state reflected by replay button');
        await pause(page, 2000);
        await page.getByRole('button', { name: '再生', exact: true }).click();
        await pause(page, 3000);
      } else if (id === 'kart-rush') {
        await visible(page.getByRole('button', { name: /レースをはじめる/ }));
        await page.getByRole('button', { name: '軽量', exact: true }).click();
        await page.getByRole('combobox', { name: '難易度' }).selectOption('easy');
        await pause(page, 3000);
        await page.getByRole('button', { name: /レースをはじめる/ }).click();
        await page.waitForFunction(() => document.querySelector('[data-testid="abyss-rush"]')?.getAttribute('data-phase') === 'racing');
        checks.push('Race entered racing state with easy difficulty and lightweight rendering');
        const before = await page.getByRole('img', { name: '海底コースと6台の位置' }).locator('circle').evaluateAll(nodes => nodes.map(n => [n.getAttribute('cx'), n.getAttribute('cy')]));
        await pause(page, 7000);
        const after = await page.getByRole('img', { name: '海底コースと6台の位置' }).locator('circle').evaluateAll(nodes => nodes.map(n => [n.getAttribute('cx'), n.getAttribute('cy')]));
        assert.equal(after.length, 6);
        assert.notDeepEqual(after, before);
        checks.push('Six vehicle markers present; their positions changed while racing');
        await page.keyboard.down('ArrowRight');
        await pause(page, 750);
        await page.keyboard.up('ArrowRight');
        await page.keyboard.down('ArrowLeft');
        await pause(page, 750);
        await page.keyboard.up('ArrowLeft');
        await pause(page, 6000);
        await page.screenshot({ path: join(output, `${id}.png`) });
        await page.getByRole('button', { name: '一時停止', exact: true }).click();
        await visible(page.getByRole('dialog', { name: '一時停止', exact: true }));
        checks.push('Pause dialog opened');
        await pause(page, 2000);
        await page.getByRole('button', { name: 'レースに戻る', exact: true }).click();
        await page.waitForFunction(() => document.querySelector('[data-testid="abyss-rush"]')?.getAttribute('data-phase') === 'racing');
        checks.push('Race resumed');
        await pause(page, 5000);
      } else {
        await visible(page.getByRole('heading', { name: '私がご案内いたします', exact: true }));
        await page.waitForFunction(() => document.querySelector('[data-testid="concierge-model"]')?.getAttribute('data-model') === 'ready');
        checks.push('Concierge heading, canvas and ready 3D model confirmed');
        await pause(page, 6000);
        await page.screenshot({ path: join(output, `${id}.png`) });
        const bath = page.getByRole('button', { name: /浴場の案内/ });
        await bath.click();
        assert.equal(await bath.getAttribute('aria-pressed'), 'true');
        await visible(page.getByRole('button', { name: '浴場ページを開く', exact: true }));
        checks.push('Bath guidance topic selected and destination action displayed');
        await pause(page, 6000);
        await page.getByRole('button', { name: '浴場ページを開く', exact: true }).click();
        await visible(page.getByRole('heading', { name: /しろみゆ/ }).first());
        checks.push('Bathhouse page heading visible');
        await pause(page, 8000);
        await page.getByRole('button', { name: 'ホーム', exact: true }).click();
        await visible(page.getByRole('heading', { name: '私がご案内いたします', exact: true }));
        await page.waitForFunction(() => document.querySelector('[data-testid="concierge-model"]')?.getAttribute('data-model') === 'ready');
        checks.push('Returned to concierge home with ready 3D model');
        await pause(page, 6000);
      }
    } catch (error) {
      failure = String(error);
    } finally {
      await page.keyboard.up('ArrowRight').catch(() => {});
      await page.keyboard.up('ArrowLeft').catch(() => {});
      await context.close();
      await video.saveAs(failure ? join(output, `${id}-failed.webm`) : destination);
      await rm(temp, { recursive: true, force: true });
    }
    const report = { id, url, revision, recordedAt: new Date().toISOString(), browser: browser.version(), viewport, backend: 'Playwright recordVideo', checks, errors: [...new Set(errors)], warnings: [...new Set(warnings)], failedRequests, failure: failure || null };
    await writeFile(join(output, `${id}.json`), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report));
    if (failure || errors.length) process.exitCode = 1;
  }
} finally { await browser.close(); }
