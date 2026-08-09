#!/usr/bin/env node
/**
 * Ensure vendor/candle-core/src exists for local / CI builds.
 *
 * Priority:
 * 1. CANDLE_CORE_READ_TOKEN / GITHUB_TOKEN for private clone
 * 2. Plain https clone (works if candle-core is public)
 */
import { existsSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const root = process.cwd();
const vendorRoot = join(root, 'vendor', 'candle-core');
const srcDir = join(vendorRoot, 'src');
const tmpDir = join(root, '.tmp-candle-core');

if (existsSync(srcDir) && existsSync(join(srcDir, 'index.ts'))) {
  console.log('[sync-candle-core] vendor/candle-core/src already present');
  process.exit(0);
}

mkdirSync(vendorRoot, { recursive: true });
rmSync(tmpDir, { recursive: true, force: true });

const token = process.env.CANDLE_CORE_READ_TOKEN || process.env.GITHUB_TOKEN || '';
const url = token
  ? `https://x-access-token:${token}@github.com/nakajima-masahiko/candle-core.git`
  : 'https://github.com/nakajima-masahiko/candle-core.git';

console.log('[sync-candle-core] cloning nakajima-masahiko/candle-core ...');
try {
  execSync(`git clone --depth 1 ${url} "${tmpDir}"`, { stdio: 'inherit' });
} catch (error) {
  console.error(
    '[sync-candle-core] clone failed. If the repo is private, set CANDLE_CORE_READ_TOKEN (PAT with repo read).',
  );
  process.exit(1);
}

rmSync(srcDir, { recursive: true, force: true });
cpSync(join(tmpDir, 'src'), srcDir, { recursive: true });
rmSync(tmpDir, { recursive: true, force: true });
console.log('[sync-candle-core] synced src -> vendor/candle-core/src');
