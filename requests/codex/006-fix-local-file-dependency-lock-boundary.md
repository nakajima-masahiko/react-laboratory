# Codex Request 006 — Fix local file dependency lock boundary after CandleCore package build

## Background

Request 005 correctly moved React Laboratory away from compiling `vendor/candle-core/src/*.ts` under React Laboratory's TypeScript settings. CandleCore is now built with its own toolchain and React Laboratory consumes the built package boundary.

However, the GitHub Pages workflow now fails at the React Laboratory root `npm ci` step.

Observed error:

```text
npm ci can only install packages when your package.json and package-lock.json are in sync
Missing: @rollup/plugin-typescript@12.3.0 from lock file
Missing: @vitest/coverage-v8@3.2.7 from lock file
Missing: vitest@3.2.7 from lock file
Missing: jsdom@26.1.0 from lock file
Missing: rollup@4.62.4 from lock file
Missing: typescript@5.9.3 from lock file
...
```

React Laboratory declares:

```json
"candle-core": "file:vendor/candle-core"
```

The synchronized `vendor/candle-core/package.json` is CandleCore's real development package manifest. After Request 005 this is desirable while CandleCore installs/builds itself, but when React Laboratory later runs root `npm ci`, npm resolves the local `file:` dependency using that same development manifest and expects CandleCore's dev/build dependency graph to be represented consistently in React Laboratory's lock context.

That violates the intended package boundary.

## Objective

Preserve the Request 005 decision:

**BUILT PACKAGE BOUNDARY**

while ensuring React Laboratory's deterministic root `npm ci` consumes only a lightweight, already-built CandleCore package surface and does not inherit CandleCore's development toolchain dependencies.

The preferred architecture is:

```text
private CandleCore checkout
        ↓
CandleCore npm ci using its original package.json/package-lock.json
        ↓
CandleCore npm run build using its own toolchain
        ↓
verify generated JavaScript + .d.ts package entries
        ↓
prepare a consumer-only local package manifest
        ↓
React Laboratory root npm ci
        ↓
React Laboratory build
```

Do not revert to exposing CandleCore implementation `.ts` files.

## Required inspection

Inspect at minimum:

- `package.json`
- `package-lock.json`
- `.github/workflows/deploy.yml`
- `scripts/sync-candle-core.mjs`
- `scripts/build-candle-core.mjs`
- `vite.config.ts`
- `src/experiments/candle-core-lab/experimentalFullRangeAdapter.ts`
- the synchronized CandleCore `package.json`, `package-lock.json`, exports and build output shape
- Request 004 and Request 005

Confirm the exact npm behavior causing the root lock mismatch before implementing the fix.

## Preferred solution: consumer-only manifest after build

After CandleCore has successfully installed and built using its original manifest, transform or stage `vendor/candle-core` into a **consumer package surface** suitable for React Laboratory's `file:` dependency.

The consumer manifest should expose only what React Laboratory needs at runtime/typecheck time, for example:

- package name/version;
- `type` if required;
- built JavaScript entry via `exports`/`main`/`module` as appropriate;
- built declaration entry via `types` / `exports.types`;
- runtime dependencies only if CandleCore genuinely has any external runtime dependencies required by the built output.

It must not require CandleCore's development-only dependencies such as Vitest, Rollup plugins, jsdom, coverage tooling, etc.

Do not guess output paths. Read CandleCore's actual post-build package metadata and verify the files exist.

### Important constraint

The original CandleCore manifest and lockfile must remain available long enough to perform CandleCore's own deterministic `npm ci` and build.

Do not overwrite the development manifest before CandleCore has finished building.

## Alternative staging shape

If mutating `vendor/candle-core/package.json` after build is fragile, an isolated staging directory is acceptable, for example conceptually:

```text
vendor/candle-core-source/      # authenticated checkout + own toolchain
vendor/candle-core-package/     # built consumer surface
```

and React Laboratory may depend on the latter.

However, prefer the smallest change that preserves the current synchronization/provenance model.

Do not copy huge source/node_modules trees into the consumer package.

## Lockfile correctness

This task must leave root `package.json` and `package-lock.json` in a state where a clean:

```bash
npm ci
```

succeeds after the consumer package surface exists.

Do not solve this by replacing `npm ci` with `npm install` in GitHub Actions.

Do not use `--legacy-peer-deps`, `--force`, or other flags simply to bypass lock consistency.

If the root lockfile legitimately needs regeneration because the local package metadata contract changed, update it intentionally and document why.

The resulting lockfile should represent the **consumer** local package, not CandleCore's internal dev dependency graph.

## Build order

Verify the workflow order carefully.

A valid order may be:

1. Checkout React Laboratory.
2. Checkout pinned private CandleCore.
3. Record/verify exact CandleCore SHA and experimental flag.
4. Setup Node.
5. Install/build CandleCore with its own lockfile/toolchain.
6. Prepare consumer-only package boundary.
7. Run React Laboratory `npm ci`.
8. Verify React Laboratory resolves built JS/declarations, never implementation TS.
9. Run React Laboratory build.
10. Upload/deploy Pages artifact.

If scripts automatically run via `prebuild`, prevent accidental repeated CandleCore `npm ci`/build or destructive manifest rewriting.

The workflow and local scripts should be idempotent enough for normal development and CI usage.

## Package-boundary verification

Retain or strengthen Request 005 verification.

Before React Laboratory compilation, assert:

- CandleCore built JS entry exists;
- CandleCore declaration entry exists;
- package export does not point to implementation `.ts`;
- React Laboratory resolves `candle-core` through the built consumer package;
- the consumer manifest does not expose CandleCore devDependencies as React Laboratory dependencies;
- `__experimentalFullRangeLod` remains available through the internal constructor runtime required by the Lab adapter;
- stable public declarations are not augmented with the private flag.

## Experimental flag constraint

The private constructor bridge from Request 003/005 must remain isolated.

Do not add `__experimentalFullRangeLod` to stable CandleCore public types just to simplify packaging.

Bounded mode must continue to pass no experimental property.

## Provenance

Preserve Request 004 provenance behavior:

`public/candle-core-validation-build.json`

must continue recording:

- React Laboratory SHA;
- synchronized CandleCore SHA.

`CANDLE_CORE_VALIDATION_REF` and `CANDLE_CORE_READ_TOKEN` behavior must remain intact.

## Non-goals

Do not:

- change CandleCore production algorithms;
- modify stable CandleCore API;
- disable `erasableSyntaxOnly` in React Laboratory to bypass the boundary;
- restore the Vite source alias;
- expose raw CandleCore `.ts` implementation files;
- replace deterministic `npm ci` with `npm install` in CI;
- add CandleCore's entire dev dependency graph to React Laboratory merely to satisfy npm;
- proceed to stable Full Range LOD API design.

## Acceptance criteria

The request is complete when:

1. CandleCore installs/builds with its own original package configuration.
2. A consumer-only built package boundary is available afterward.
3. React Laboratory root `npm ci` succeeds with a clean checkout after that boundary is prepared.
4. React Laboratory does not require CandleCore's dev dependencies in its own lockfile.
5. `npm run build` succeeds in the authenticated Pages path.
6. No TS1294 source-boundary regression occurs.
7. Stable CandleCore public type/export files are not changed.
8. Experimental constructor flag remains Lab-only.
9. exact SHA provenance remains published.
10. the Pages workflow can proceed to deployment and Scenario H–L validation.

## Testing

Run/report as available:

```bash
npm ci
npm run build:candle-core
npm run build
```

Also validate:

- clean lockfile consistency;
- consumer manifest contents;
- built package entry resolution;
- no implementation `.ts` exports;
- workflow YAML parsing;
- `git diff --check`;
- relevant focused ESLint checks.

If local private CandleCore access is unavailable, reproduce the package-boundary behavior using the available synchronized fixture only if that is semantically accurate; otherwise clearly state the limitation and ensure GitHub Actions can complete the final verification.

## Final report

Return:

1. Root cause confirmation
2. Final package-boundary architecture
3. Whether manifest mutation or separate staging directory was chosen
4. Consumer manifest shape
5. Root lockfile changes and why
6. Build/workflow order
7. Verification that CandleCore devDependencies no longer leak into React Laboratory root install
8. Stable API / experimental flag status
9. Pages provenance status
10. Testing results
11. Remaining blockers to Scenarios H–L
12. Commit SHA / PR metadata if available

The purpose of Request 006 is to complete the package-boundary correction started by Request 005 without sacrificing deterministic installs or library/consumer isolation.