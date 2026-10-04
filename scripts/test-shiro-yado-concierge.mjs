/** Exercise the speech lifecycle and actual GLB rig without a GPU or device voice. */
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { Bone, PerspectiveCamera, SkinnedMesh, Texture, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const base = resolve('node_modules/.tmp');
mkdirSync(base, { recursive: true });
const output = mkdtempSync(join(base, 'concierge-test-'));
writeFileSync(join(output, 'package.json'), '{"type":"module"}');
for (const name of ['concierge-playback', 'scene/concierge-mouth', 'scene/concierge-finish', 'scene/concierge-rig']) {
  const source = readFileSync(`src/experiments/shiro-yado/${name}.ts`, 'utf8');
  const result = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
  mkdirSync(join(output, 'scene'), { recursive: true });
  writeFileSync(join(output, `${name}.js`), result.outputText.replace(/(from ['"])(\.[^'"]+)(['"])/g, '$1$2.js$3'));
}
after(() => rmSync(output, { recursive: true, force: true }));
const { createConciergePlayback } = await import(pathToFileURL(join(output, 'concierge-playback.js')));
const { createConciergeRig } = await import(pathToFileURL(join(output, 'scene/concierge-rig.js')));
const loader = new GLTFLoader();
loader.register(() => ({ name: 'test-textures', loadTexture: () => Promise.resolve(new Texture()) }));
const bytes = readFileSync('public/models/shiro-yado/hotel-concierge.glb');
const asset = await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');

function setup(t, options = {}) {
  const utterances = [], states = [];
  const synth = { cancel() {}, getVoices: () => [], speak: (utterance) => utterances.push(utterance) };
  const playback = createConciergePlayback({ synth, Utterance: class { constructor(text) { this.text = text; } }, onChange: (state) => states.push(state), language: 'ja-JP', enabled: true, ...options });
  t.after(() => playback.dispose());
  return { playback, utterances, states };
}

test('real bow completes before speech; speech end smiles and tilts; replay resets the mouth', (t) => {
  const { playback, utterances } = setup(t);
  const rig = createConciergeRig(asset.scene, asset.animations, playback.completeBow);
  t.after(() => rig.dispose());
  let face, head;
  rig.model.traverse((object) => {
    if (object instanceof SkinnedMesh && object.material.name === 'Head') face = object;
    if (object instanceof Bone && /^Head(?:_\d+)?$/.test(object.name)) head = object;
  });
  assert.ok(face && head);
  const neutral = new Float32Array(face.geometry.attributes.position.array);
  const advance = (frames) => {
    for (let i = 0; i < frames; i++) rig.update(playback.state, 1 / 60, i * 1000 / 60, playback.getBoundaryTime());
  };
  playback.speak('ようこそ、白の宿へ。');
  assert.equal(playback.state.phase, 'bowing');
  advance(180);
  assert.equal(utterances.length, 0);
  advance(50);
  assert.equal(utterances.length, 1);
  assert.equal(playback.state.phase, 'loading');
  assert.deepEqual(face.geometry.attributes.position.array, neutral);
  utterances[0].onstart(); advance(40);
  assert.equal(playback.state.phase, 'speaking');
  assert.notDeepEqual(face.geometry.attributes.position.array, neutral);
  utterances[0].onend(); advance(120);
  assert.equal(playback.state.phase, 'finished');
  assert.ok(rig.smile > 0.99);
  assert.ok(Math.abs(head.quaternion.z) > 0.04);
  advance(600);
  assert.equal(rig.smile, 0.85);
  assert.ok(Math.abs(head.quaternion.z) < 0.07, 'held tilt must not accumulate');
  playback.speak('お部屋のご案内です。'); advance(1);
  assert.equal(utterances.length, 2, 'replay starts inside the click without another async bow');
  assert.deepEqual(face.geometry.attributes.position.array, neutral);
  assert.equal(rig.smile, 0);
});

test('stop, replacement, failure, mute and disposal reject stale speech completion', (t) => {
  const { playback, utterances } = setup(t);
  playback.speak('first');
  const firstBow = playback.state.requestId;
  playback.speak('replacement');
  playback.completeBow(firstBow);
  assert.equal(utterances.length, 0);
  playback.completeBow(playback.state.requestId);
  const old = utterances[0]; old.onstart();
  playback.speak('newer');
  old.onend(); old.onstart();
  assert.equal(playback.state.phase, 'loading');
  const current = utterances[1]; current.onstart();
  playback.stop(); current.onend();
  assert.equal(playback.state.phase, 'idle');
  playback.speak('blocked'); utterances[2].onerror({ error: 'not-allowed' });
  assert.equal(playback.state.phase, 'error');
  playback.speak('retry');
  assert.equal(playback.state.phase, 'loading');
  playback.configure('ja-JP', false); utterances[3].onend();
  assert.equal(playback.state.phase, 'idle');
  playback.configure('en-US', true); playback.speak('Welcome');
  assert.equal(playback.state.phase, 'bowing');
  playback.completeBow(playback.state.requestId);
  assert.equal(utterances[4].lang, 'en-US');
  playback.dispose(); utterances[4].onend();
  assert.equal(playback.state.phase, 'idle');
});

test('photo/missing voice can finish the bow without leaving playback busy', (t) => {
  const { playback, utterances } = setup(t, { synth: undefined, Utterance: undefined });
  playback.speak('text-only greeting');
  playback.completeBow(playback.state.requestId);
  assert.equal(playback.state.phase, 'idle');
  assert.equal(playback.state.isSupported, false);
  assert.equal(utterances.length, 0);
});

test('fixed frontal camera frames the chest and leaves space above the head on narrow screens', () => {
  for (const aspect of [9 / 16, 390 / 220, 300 / 320]) {
    const camera = new PerspectiveCamera(34, aspect, 0.01, 20);
    camera.position.set(0, 1.51, 0.85); camera.lookAt(0, 1.51, 0); camera.updateMatrixWorld(true);
    const chest = new Vector3(0, 1.29, 0.08).project(camera);
    const hair = new Vector3(0, 1.72, 0).project(camera);
    assert.ok(chest.y < -0.9 && chest.y > -1);
    assert.ok(hair.y > 0.6 && hair.y < 0.9);
  }
});
