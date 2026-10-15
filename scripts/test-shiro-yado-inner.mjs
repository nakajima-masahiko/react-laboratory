/** Verify useful inner-page content is available before any GPU-dependent preview. */
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const base = resolve('node_modules/.tmp');
mkdirSync(base, { recursive: true });
const output = mkdtempSync(join(base, 'shiro-inner-'));
writeFileSync(join(output, 'package.json'), '{"type":"module"}');
function compile(directory, relative = '') {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    const name = join(relative, entry.name);
    if (entry.isDirectory()) { mkdirSync(join(output, name), { recursive: true }); compile(path, name); }
    else if (/\.tsx?$/.test(name)) {
      const source = readFileSync(path, 'utf8').replaceAll('import.meta.env.BASE_URL', "'/react-laboratory/'");
      const result = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022, jsx: ts.JsxEmit.ReactJSX } });
      writeFileSync(join(output, name.replace(/\.tsx?$/, '.js')), result.outputText
        .replace(/import ['"][^'"]+\.css['"];?/g, '')
        .replace(/(from ['"])(\.[^'"]+)(['"])/g, '$1$2.js$3'));
    }
  }
}
compile('src/experiments/shiro-yado');
after(() => rmSync(output, { recursive: true, force: true }));
const { NavContext } = await import(pathToFileURL(join(output, 'nav-state.js')));
const { BathView } = await import(pathToFileURL(join(output, 'BathView.js')));
const { BookingView } = await import(pathToFileURL(join(output, 'booking/BookingView.js')));
const { ReservationsView } = await import(pathToFileURL(join(output, 'booking/ReservationsView.js')));
const { GuideView, FloorView, PlaceView } = await import(pathToFileURL(join(output, 'views.js')));
const { RoomsView } = await import(pathToFileURL(join(output, 'booking/RoomsView.js')));
const { BookingWelcome } = await import(pathToFileURL(join(output, 'booking/BookingWelcome.js')));
const { CheckinView } = await import(pathToFileURL(join(output, 'views.js')));
const { JOURNEY, stayDate } = await import(pathToFileURL(join(output, 'booking/ux-copy.js')));
const { RoomSummary } = await import(pathToFileURL(join(output, 'booking/RoomSummary.js')));
const { DiningView } = await import(pathToFileURL(join(output, 'dining/DiningView.js')));
const { DiningEntry } = await import(pathToFileURL(join(output, 'dining/DiningEntry.js')));
const { DINING } = await import(pathToFileURL(join(output, 'dining/copy.js')));
const { getPlace } = await import(pathToFileURL(join(output, 'hotel-data.js')));
function render(component, props = {}) {
  return renderToStaticMarkup(createElement(NavContext.Provider, { value: { view: { v: 'guide' }, go() {} } }, createElement(component, props)));
}

test('bath hours and directions come before the mural; 3D stays optional', () => {
  const html = render(BathView);
  assert.ok(html.indexOf('15:00–24:00 / 6:00–10:00') < html.indexOf('<figure'));
  assert.ok(html.indexOf('ここへの行き方') < html.indexOf('<figure'));
  assert.match(html, /富士山と松の壁画/);
  assert.match(html, /浴場の中を3Dで見る/);
  assert.doesNotMatch(html, /<canvas|3Dを表示できません|読み込み中/);
});
test('route steps and arrival action precede the map and optional scene', () => {
  const html = render(GuideView, { destId: 'bath' });
  assert.match(html, /ロビー奥のエレベーターホール/);
  assert.ok(html.indexOf('こちらの順にお進みください') < html.indexOf('到着したので現在地を更新'));
  assert.ok(html.indexOf('到着したので現在地を更新') < html.indexOf('3階の位置'));
  assert.ok(html.indexOf('3階の位置') < html.indexOf('到着する場所を3Dで見る'));
  assert.match(html, /この行き方を音声で聞く/);
  assert.doesNotMatch(html, /<canvas|3Dを表示できません/);
});

test('booking begins with a demo notice, date fields and a guest count, without personal or payment fields', () => {
  const html = render(BookingView);
  assert.match(html, /体験用の予約/);
  assert.equal((html.match(/type="date"/g) ?? []).length, 2);
  assert.match(html, /宿泊人数/);
  assert.match(html, /空室・料金を見る/);
  assert.doesNotMatch(html, /type="(?:email|tel|password)"|<canvas/);
});
test('reservation management explains browser-local storage and offers search when empty', () => {
  const html = render(ReservationsView);
  assert.match(html, /このブラウザに保存されたご予約はありません/);
  assert.match(html, /別の端末とは共有されません/);
  assert.match(html, /空室・料金を見る/);
});

test('arrival guide and room catalogue have distinct purposes; room browsing never requires WebGL', () => {
  const html = render(RoomsView);
  assert.match(html, /客室・予約/);
  assert.equal((html.match(/<article/g) ?? []).length, 5);
  assert.match(html, /￥12,000/);
  assert.match(html, /￥22,000/);
  assert.match(html, /客室デザイン案/);
  assert.match(html, /お部屋への案内/);
  assert.doesNotMatch(html, /<canvas|読み込み中/);
  assert.match(render(CheckinView), /お部屋への案内/);
});
test('welcome offers both a direct search and browsing path, with no payment notice, in every locale', () => {
  const html = render(BookingWelcome);
  assert.match(html, /空室・料金を見る/);
  assert.match(html, /お部屋を見て選ぶ/);
  assert.match(html, /お支払い不要/);
  assert.match(html, /1か月先/);
  for (const locale of ['ja', 'en', 'fr', 'es', 'zh', 'ko']) {
    for (const text of Object.values(JOURNEY[locale])) assert.equal(typeof text, 'string');
    assert.ok(stayDate(locale, '2026-10-18').length > 0);
  }
  assert.match(stayDate('ja', '2026-10-18'), /10月18日.*日/);
});

test('every room has its own interior concept, while room 204 retains its approved image', () => {
  const html = render(RoomSummary, { roomId: 'room-204' });
  assert.match(html, /src="\/react-laboratory\/shiro-yado\/room-204-morning.webp"/);
  assert.match(html, /alt="朝の光が入る二面窓/);
  assert.match(html, /width="1536" height="1024"/);
  assert.match(html, /AI生成・イメージ/);
  assert.match(html, /窓辺でお茶と読書/);
  for (const id of ['201', '202', '203', '205']) {
    const room = render(RoomSummary, { roomId: `room-${id}` });
    assert.ok(room.includes(`room-${id}-interior.webp`));
    assert.match(room, /AI生成・イメージ/);
    assert.doesNotMatch(room, /<svg/);
  }
});

test('dining clearly separates fictional meals from room reservations and connects to the hall', () => {
  const html = render(DiningView);
  assert.match(html, /現在の体験用客室予約に食事は含まれません/);
  assert.match(html, /食事の予約・追加・お支払いは行いません/);
  assert.match(html, /アレルギー対応を保証するものではありません/);
  for (const text of ['7:00–9:00', '8:30', '18:00–20:00', '19:00', '1,800', '4,800', '白の間への行き方', 'だし巻き卵', '茶碗蒸し']) assert.ok(html.includes(text));
  assert.match(html, /dining-breakfast.webp/);
  assert.match(html, /dining-dinner.webp/);
  assert.doesNotMatch(html, /<form|<canvas/);
  assert.match(render(DiningEntry), /お食事を楽しむ/);
});
test('all six dining languages explain both meals, the demo boundary and allergy limits', () => {
  for (const locale of ['ja', 'en', 'fr', 'es', 'zh', 'ko']) {
    const copy = DINING[locale];
    for (const key of ['notice', 'allergyBody', 'childrenBody', 'speech', 'venue', 'directions']) assert.ok(copy[key].trim().length > 0, `${locale}: ${key}`);
    for (const meal of ['breakfast', 'dinner']) {
      assert.equal(copy[meal].menu.length, 6);
      assert.ok(copy[meal].alt.length > 10);
    }
  }
});

test('third floor begins with its shared-space image and useful destinations, without mounting 3D', () => {
  const html = render(FloorView, { floor: 3 });
  assert.match(html, /shared-floor-3.webp/);
  assert.match(html, /今日は、どちらへ/);
  assert.match(html, /bath-fuji-mural.svg/);
  assert.match(html, /お手洗い/);
  assert.match(html, /お食事を楽しむ/);
  assert.match(html, /3階の空間を3Dで見る/);
  assert.ok(html.indexOf('shared-floor-3.webp') < html.indexOf('今日は、どちらへ'));
  assert.doesNotMatch(html, /data-scene=|<canvas|空間を読み込み中/);
});
test('White Hall uses an image, explains enjoyable uses and keeps 3D closed by default', () => {
  const html = render(PlaceView, { place: getPlace('banquet') });
  for (const text of ['banquet-white-hall.webp', '食卓を囲む', '小さなお祝いに', '集まって、話す', 'お食事を楽しむ', '白の間を3Dで見る', '正確な位置は館内図']) assert.ok(html.includes(text), text);
  assert.ok(html.indexOf('banquet-white-hall.webp') < html.indexOf('お食事を楽しむ'));
  assert.doesNotMatch(html, /data-scene=|<canvas|空間を読み込み中/);
});
