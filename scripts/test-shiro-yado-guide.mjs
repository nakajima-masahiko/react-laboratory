/** All origin/destination pairs and locales must share one text/voice route. */
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const base = resolve('node_modules/.tmp');
mkdirSync(base, { recursive: true });
const output = mkdtempSync(join(base, 'shiro-guide-'));
writeFileSync(join(output, 'package.json'), '{"type":"module"}');
for (const name of ['hotel-data', 'guide', 'i18n', 'concierge-content', 'place-i18n', 'route-text', 'place-translation', ...['en','fr','es','zh','ko'].map(l => `place-data-${l}`)]) {
  const source = readFileSync(`src/experiments/shiro-yado/${name}.ts`, 'utf8');
  const result = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
  writeFileSync(join(output, `${name}.js`), result.outputText.replace(/(from ['"])(\.[^'"]+)(['"])/g, '$1$2.js$3'));
}
after(() => rmSync(output, { recursive: true, force: true }));
const { PLACES } = await import(pathToFileURL(join(output, 'hotel-data.js')));
const { buildGuide } = await import(pathToFileURL(join(output, 'guide.js')));
const { getConciergeSpeech } = await import(pathToFileURL(join(output, 'i18n.js')));
const { localizePlace } = await import(pathToFileURL(join(output, 'place-i18n.js')));

for (const locale of ['ja', 'en', 'fr', 'es', 'zh', 'ko']) {
  test(`${locale}: all 81 routes handle floors and arrival; voice matches the displayed steps`, () => {
    for (const from of Object.values(PLACES)) for (const dest of Object.values(PLACES)) {
      const guide = buildGuide({ floor: from.floor, placeId: from.id }, dest.id, locale);
      assert.ok(guide);
      assert.equal(guide.viaElevator, from.floor !== dest.floor);
      assert.equal(guide.steps.length, from.id === dest.id ? 1 : from.floor === dest.floor ? 3 : 4);
      if (dest.id === 'lobby') continue; // No lobby topic in the concierge menu.
      const speech = getConciergeSpeech(locale, dest.kind === 'room' ? 'rooms' : dest.id, from.floor, from.id, dest.id);
      for (const step of guide.steps) assert.ok(speech.includes(step.body));
    }
  });
}
test('204 directions follow the right-hand plan; same-floor routes do not say to exit a lift', () => {
  const guide = buildGuide({ floor: 2, placeId: 'room-201' }, 'room-204', 'ja');
  assert.match(guide.steps[1].body, /右手/);
  assert.doesNotMatch(guide.steps.map(s => s.body).join(' '), /階で降り/);
  assert.equal(guide.steps[2].body, PLACES['room-204'].name);
});
test('all selected languages have their own facility and room descriptions', () => {
  for (const locale of ['fr', 'es', 'zh', 'ko']) for (const id of Object.keys(PLACES)) {
    const place = localizePlace(locale, id);
    assert.notEqual(place.description, localizePlace('en', id).description);
    assert.ok(place.amenities.length >= 3);
    assert.ok(place.name && place.summary && place.fromElevator);
  }
  assert.match(localizePlace('ja', 'bath').description, /富士山/);
});

test('lobby directions stay inside the hotel in every language', () => {
  const phrases = { ja: 'ロビー奥', en: 'back of the lobby', fr: 'fond du hall', es: 'fondo del vestíbulo', zh: '大堂内侧', ko: '로비 안쪽' };
  for (const [locale, phrase] of Object.entries(phrases)) {
    const guide = buildGuide({ floor: 1, placeId: 'lobby' }, 'bath', locale);
    assert.ok(guide.steps[0].body.includes(phrase));
    assert.equal(guide.steps[0].body, localizePlace(locale, 'lobby').toElevator);
  }
  assert.doesNotMatch(buildGuide({ floor: 1, placeId: 'lobby' }, 'bath', 'ja').steps[0].body, /入口を出|戻/);
});
