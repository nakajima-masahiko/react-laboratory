#!/usr/bin/env node
/** Build the synchronized library with its own toolchain and verify its package boundary. */
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageRoot = join(root, 'vendor', 'candle-core');
const packagePath = join(packageRoot, 'package.json');

if (!existsSync(join(packageRoot, 'src', 'index.ts'))) {
  console.error('[build-candle-core] synchronized CandleCore source is missing');
  process.exit(1);
}

console.log('[build-candle-core] installing and building with CandleCore configuration');
execFileSync('npm', ['ci'], { cwd: packageRoot, stdio: 'inherit' });
execFileSync('npm', ['run', 'build'], { cwd: packageRoot, stdio: 'inherit' });

const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
const rootExport = packageJson.exports?.['.'];
const entryCandidates = [
  typeof rootExport === 'string' ? rootExport : undefined,
  rootExport?.import,
  rootExport?.default,
  packageJson.module,
  packageJson.main,
].filter((entry) => typeof entry === 'string');
const typeCandidates = [rootExport?.types, packageJson.types].filter(
  (entry) => typeof entry === 'string',
);

if (entryCandidates.length === 0 || typeCandidates.length === 0) {
  throw new Error('CandleCore must publish JavaScript and declaration entry points');
}

for (const entry of [...entryCandidates, ...typeCandidates]) {
  if (entry.endsWith('.ts') && !entry.endsWith('.d.ts')) {
    throw new Error(`CandleCore package entry must not expose implementation TypeScript: ${entry}`);
  }
  if (!existsSync(resolve(packageRoot, entry))) {
    throw new Error(`CandleCore package entry does not exist after build: ${entry}`);
  }
}

console.log(`[build-candle-core] verified built package entries: ${entryCandidates.join(', ')}`);
