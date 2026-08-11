#!/usr/bin/env node
/** Build CandleCore with its own toolchain, then expose only its consumer surface. */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageRoot = join(root, 'vendor', 'candle-core');
const packagePath = join(packageRoot, 'package.json');
const consumerMarker = 'reactLaboratoryConsumerPackage';

if (!existsSync(join(packageRoot, 'src', 'index.ts'))) {
  console.error('[build-candle-core] synchronized CandleCore source is missing');
  process.exit(1);
}

const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

if (!packageJson[consumerMarker]) {
  if (!existsSync(join(packageRoot, 'package-lock.json'))) {
    throw new Error('CandleCore package-lock.json is required for its deterministic build');
  }

  console.log('[build-candle-core] installing and building with CandleCore configuration');
  execFileSync('npm', ['ci'], { cwd: packageRoot, stdio: 'inherit' });
  execFileSync('npm', ['run', 'build'], { cwd: packageRoot, stdio: 'inherit' });
}

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

const builtFiles = [...new Set([...entryCandidates, ...typeCandidates])];
function collectFiles(directory, predicate) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((item) => {
    const path = join(directory, item.name);
    return item.isDirectory()
      ? collectFiles(path, predicate)
      : predicate(path) && statSync(path).isFile()
        ? [path]
        : [];
  });
}

const outputDirectories = [
  ...new Set(builtFiles.map((entry) => dirname(resolve(packageRoot, entry)))),
];
const outputFiles = [
  ...new Set(outputDirectories.flatMap((directory) => collectFiles(directory, () => true))),
];
const javascript = outputFiles
  .filter((path) => /\.(?:c|m)?js$/.test(path))
  .map((path) => readFileSync(path, 'utf8'))
  .join('\n');
const declarations = outputFiles
  .filter((path) => path.endsWith('.d.ts'))
  .map((path) => readFileSync(path, 'utf8'))
  .join('\n');

if (!javascript.includes('__experimentalFullRangeLod')) {
  throw new Error('CandleCore built JavaScript does not contain the laboratory constructor flag');
}
if (declarations.includes('__experimentalFullRangeLod')) {
  throw new Error('CandleCore public declarations must not expose the laboratory constructor flag');
}

if (!packageJson[consumerMarker]) {
  const runtimeDependencies = packageJson.dependencies ?? {};
  if (Object.keys(runtimeDependencies).length > 0) {
    throw new Error(
      'CandleCore now has runtime dependencies; update the React Laboratory lockfile intentionally',
    );
  }

  const consumerPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    ...(packageJson.type ? { type: packageJson.type } : {}),
    ...(packageJson.sideEffects !== undefined ? { sideEffects: packageJson.sideEffects } : {}),
    ...(packageJson.main ? { main: packageJson.main } : {}),
    ...(packageJson.module ? { module: packageJson.module } : {}),
    ...(packageJson.types ? { types: packageJson.types } : {}),
    exports: { '.': rootExport },
    [consumerMarker]: true,
  };

  // This happens only after CandleCore's own npm ci and build have completed.
  // npm at the repository root must see a package contract, not CandleCore's
  // private test/build toolchain, when resolving the local file dependency.
  writeFileSync(packagePath, `${JSON.stringify(consumerPackageJson, null, 2)}\n`);
}

console.log(`[build-candle-core] verified consumer package entries: ${builtFiles.join(', ')}`);
