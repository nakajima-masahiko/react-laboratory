#!/usr/bin/env node
/**
 * Ensure vendor/candle-core/src exists for local builds.
 *
 * CI uses actions/checkout with secrets.CANDLE_CORE_READ_TOKEN instead.
 * Do NOT fall back to GITHUB_TOKEN — it cannot read other private repos (403).
 */
import { existsSync, mkdirSync, rmSync, cpSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const root = process.cwd();
const vendorRoot = join(root, 'vendor', 'candle-core');
const srcDir = join(vendorRoot, 'src');
const tmpDir = join(root, '.tmp-candle-core');

const packageJson = {
  name: 'candle-core',
  version: '0.2.0-beta-prep',
  private: true,
  type: 'module',
  main: './src/index.ts',
  module: './src/index.ts',
  types: './src/index.ts',
  exports: {
    '.': {
      import: './src/index.ts',
      types: './src/index.ts',
    },
  },
};

mkdirSync(vendorRoot, { recursive: true });
writeFileSync(join(vendorRoot, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`);

if (existsSync(join(srcDir, 'index.ts'))) {
  console.log('[sync-candle-core] vendor/candle-core/src already present');
  process.exit(0);
}

const token = process.env.CANDLE_CORE_READ_TOKEN || '';
if (!token) {
  console.error(`[sync-candle-core] missing CANDLE_CORE_READ_TOKEN

candle-core is private. Set a PAT and export it:

  export CANDLE_CORE_READ_TOKEN=ghp_xxxx   # or github_pat_xxxx
  npm run sync:candle-core

Fine-grained PAT checklist:
  - Resource owner: nakajima-masahiko
  - Repository access: Only select repositories → candle-core
  - Permissions → Repository → Contents: Read-only

Classic PAT checklist:
  - scope: repo

Alternative: make candle-core public, then plain clone works without a token.
`);
  process.exit(1);
}

rmSync(tmpDir, { recursive: true, force: true });
const url = `https://x-access-token:${token}@github.com/nakajima-masahiko/candle-core.git`;

console.log('[sync-candle-core] cloning nakajima-masahiko/candle-core with CANDLE_CORE_READ_TOKEN ...');
try {
  execSync(`git clone --depth 1 "${url}" "${tmpDir}"`, { stdio: 'inherit' });
} catch {
  console.error(`[sync-candle-core] clone failed with 403/auth error.

Your PAT cannot read nakajima-masahiko/candle-core.
Re-create the token with Contents: Read on that repo, update the secret, and retry.

GitHub error "Write access to repository not granted" usually means the token
has no access at all (not that write is required).
`);
  process.exit(1);
}

rmSync(srcDir, { recursive: true, force: true });
cpSync(join(tmpDir, 'src'), srcDir, { recursive: true });
rmSync(tmpDir, { recursive: true, force: true });
console.log('[sync-candle-core] synced src -> vendor/candle-core/src');
