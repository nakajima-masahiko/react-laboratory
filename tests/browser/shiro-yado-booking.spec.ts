import { expect, test, type Page } from '@playwright/test';
import { addDays, roomAvailability, type Stay } from '../../src/experiments/shiro-yado/booking/model';

const TODAY = '2026-10-15';
const stay: Stay = (() => {
  for (let i = 0; i < 20; i++) {
    const checkIn = addDays(TODAY, i);
    const candidate = { checkIn, checkOut: addDays(checkIn, 2), guests: 4 };
    if (!roomAvailability('room-205', candidate, [], TODAY)) return candidate;
  }
  throw new Error('No family room fixture');
})();
test.use({ launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }, reducedMotion: 'reduce' });
test.beforeEach(async ({ page }) => { await page.clock.install({ time: new Date('2026-10-15T03:00:00Z') }); });
async function search(page: Page) {
  await page.getByLabel('チェックイン', { exact: true }).fill(stay.checkIn);
  await page.getByLabel('チェックアウト', { exact: true }).fill(stay.checkOut);
  await page.getByLabel('宿泊人数', { exact: true }).selectOption('4');
  await page.getByRole('button', { name: '空室・料金を見る', exact: true }).click();
}
async function review(page: Page) {
  await search(page);
  await page.getByRole('button', { name: 'このお部屋を選ぶ', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'ご予約内容の確認', exact: true })).toBeVisible();
}
for (const viewport of [{ width: 1280, height: 960 }, { width: 320, height: 740 }]) {
  test(`book, reload, cancel and release room at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ colorScheme: viewport.width === 320 ? 'dark' : 'light' });
    await page.goto('#/experiments/shiro-yado/booking/room-205');
    await review(page);
    await expect(page.getByText('￥44,000', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: '体験用の予約を確定する' }).click();
    await expect(page.getByRole('heading', { name: 'ご予約を承りました' })).toBeVisible();
    await expect(page.getByText(/^SY-\d{8}-[A-F0-9]{8}$/)).toBeVisible();
    await page.reload();
    await page.getByRole('button', { name: 'ご予約内容', exact: true }).click();
    await expect(page.getByText('予約済み', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: '空室・料金を見る', exact: true }).click();
    await search(page);
    await expect(page.getByText(/この条件で空いているお部屋がありません/)).toBeVisible();
    await page.getByRole('button', { name: 'ご予約内容', exact: true }).click();
    await page.getByRole('button', { name: '予約をキャンセル', exact: true }).click();
    await page.getByRole('button', { name: 'この予約を取り消す', exact: true }).click();
    await expect(page.getByText('キャンセル済み', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: '空室・料金を見る', exact: true }).click();
    await search(page);
    await expect(page.getByRole('button', { name: 'このお部屋を選ぶ' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(await page.locator('.shiro-yado').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(255, 255, 255)');
  });
}
test('latest availability is checked again when two tabs confirm the same stay', async ({ page, context }) => {
  await page.goto('#/experiments/shiro-yado/booking');
  await review(page);
  const second = await context.newPage();
  await second.clock.install({ time: new Date('2026-10-15T03:00:00Z') });
  await second.goto('#/experiments/shiro-yado/booking');
  await review(second);
  await page.getByRole('button', { name: '体験用の予約を確定する' }).click();
  await expect(page.getByRole('heading', { name: 'ご予約を承りました' })).toBeVisible();
  await second.getByRole('button', { name: '体験用の予約を確定する' }).click();
  await expect(second.getByRole('alert')).toContainText('この日程のお部屋は選べなくなりました');
  expect(await second.evaluate(() => JSON.parse(localStorage.getItem('shiro-yado-bookings-v1')!).reservations.length)).toBe(1);
});
test('failed persistence leaves the reservation unconfirmed', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('quota', 'QuotaExceededError'); };
  });
  await page.goto('#/experiments/shiro-yado/booking');
  await review(page);
  await page.getByRole('button', { name: '体験用の予約を確定する' }).click();
  await expect(page.getByRole('alert')).toContainText('今回の操作は完了していません');
  await expect(page.getByRole('heading', { name: 'ご予約内容の確認' })).toBeVisible();
});
test('new booking UI follows the chosen language', async ({ page }) => {
  await page.goto('#/experiments/shiro-yado/booking');
  await page.getByRole('combobox', { name: '言語', exact: true }).selectOption('fr');
  await expect(page.getByRole('heading', { name: 'Séjourner à Shiro Yado' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Voir les chambres et tarifs' })).toBeVisible();
});

for (const width of [320, 1280]) {
  test(`welcome search and room browsing remain reachable after selecting a guide room at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: width === 320 ? 'dark' : 'light' });
    await page.goto('#/experiments/shiro-yado');
    const welcome = page.getByRole('region', { name: '客室・予約', exact: true });
    await expect(welcome.getByText('予約体験・お支払い不要')).toBeVisible();
    await welcome.getByRole('button', { name: '空室・料金を見る', exact: true }).click();
    await expect(page.getByTestId('booking-page')).toBeVisible();
    await page.getByRole('navigation', { name: 'Quick navigation' }).getByRole('button', { name: '客室・予約', exact: true }).click();
    const rooms = page.getByTestId('rooms-page');
    await expect(rooms.getByRole('article')).toHaveCount(5);
    await rooms.getByRole('button', { name: 'お部屋への案内', exact: true }).click();
    await page.getByRole('button', { name: /201 スタンダードツイン/ }).click();
    await page.getByRole('navigation', { name: 'Quick navigation' }).getByRole('button', { name: '客室・予約', exact: true }).click();
    await expect(rooms).toBeVisible();
    const family = rooms.getByRole('article', { name: '205 ファミリールーム', exact: true });
    await family.getByRole('button', { name: '空室・料金を見る', exact: true }).click();
    await expect(page).toHaveURL(/booking\/room-205$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
