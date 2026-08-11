#!/usr/bin/env node
/**
 * Ensure a complete CandleCore checkout exists for local builds.
 *
 * CI uses actions/checkout with secrets.CANDLE_CORE_READ_TOKEN instead.
 * Do NOT fall back to GITHUB_TOKEN — it cannot read other private repos (403).
 */
import { existsSync, rmSync, cpSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const root = process.cwd();
const vendorRoot = join(root, 'vendor', 'candle-core');
const srcDir = join(vendorRoot, 'src');
const tmpDir = join(root, '.tmp-candle-core');

if (
  existsSync(join(srcDir, 'index.ts'))
  && existsSync(join(vendorRoot, 'package-lock.json'))
) {
  console.log('[sync-candle-core] vendor/candle-core checkout already present');
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
  execFileSync('git', ['clone', '--depth', '1', url, tmpDir], { stdio: 'inherit' });
} catch {
  console.error(`[sync-candle-core] clone failed with 403/auth error.

Your PAT cannot read nakajima-masahiko/candle-core.
Re-create the token with Contents: Read on that repo, update the secret, and retry.

GitHub error "Write access to repository not granted" usually means the token
has no access at all (not that write is required).
`);
  process.exit(1);
}

rmSync(vendorRoot, { recursive: true, force: true });
rmSync(join(tmpDir, '.git'), { recursive: true, force: true });
cpSync(tmpDir, vendorRoot, { recursive: true });
rmSync(tmpDir, { recursive: true, force: true });
console.log('[sync-candle-core] synchronized complete package -> vendor/candle-core');
