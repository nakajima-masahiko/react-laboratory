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
const { GuideView } = await import(pathToFileURL(join(output, 'views.js')));
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
