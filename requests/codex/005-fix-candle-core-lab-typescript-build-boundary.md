# Codex Request 005 — Fix CandleCore Lab TypeScript build boundary

## Goal

Fix the GitHub Pages build failure introduced when `react-laboratory` compiles synchronized CandleCore source directly under React Laboratory's TypeScript compiler settings.

This task is not about changing Full Range LOD behavior. It is about establishing a clean and robust TypeScript/package boundary between `react-laboratory` and the private synchronized `candle-core` checkout.

The current Pages build fails with two distinct classes of errors:

```text
src/experiments/candle-core-lab/experimentalFullRangeAdapter.ts(24,32):
TS2345: Argument of type 'ChartOptions | { __experimentalFullRangeLod: true; ... } | undefined'
is not assignable to parameter of type
'ChartOptions & { __experimentalFullRangeLod?: boolean | undefined; }'.
```

and:

```text
vendor/candle-core/src/chart/CandleRenderer.ts(...): TS1294
vendor/candle-core/src/experimental/ExperimentalFullRangeLod.ts(...): TS1294
vendor/candle-core/src/prototype/CoarseOhlcExtremaPyramidPrototype.ts(...): TS1294
This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
```

`react-laboratory/tsconfig.app.json` currently uses:

```json
"erasableSyntaxOnly": true
```

The Pages workflow currently rewrites `vendor/candle-core/package.json` so `candle-core` resolves directly to `./src/index.ts`, which causes consumer compilation to apply React Laboratory's TypeScript restrictions to CandleCore implementation source.

## Required reading

Inspect at least:

- `requests/codex/003-integrate-experimental-full-range-lod.md`
- `requests/codex/004-validate-experimental-full-range-lod-on-pages.md`
- `src/experiments/candle-core-lab/experimentalFullRangeAdapter.ts`
- `scripts/sync-candle-core.mjs`
- `.github/workflows/deploy.yml`
- `tsconfig.app.json`
- package / Vite / TypeScript resolution config
- synchronized CandleCore package/build configuration
- CandleCore files reported by TS1294
- CandleCore `src/index.ts`, `src/publicApi.ts`, `src/types.ts`

Also inspect how CandleCore itself is intended to be built and consumed. Do not assume that source-import is the intended long-term package contract merely because the Lab currently uses it.

## Core design question

Determine the correct ownership boundary:

### Option A — Consumer compiles CandleCore source

Keep source-level consumption, but make the synchronized CandleCore source compatible with React Laboratory's `erasableSyntaxOnly` rules.

This is acceptable only if CandleCore intentionally supports source consumption under this restriction and the required syntax changes are reasonable, local, and beneficial to CandleCore itself.

### Option B — CandleCore owns its own compilation boundary

Build CandleCore using CandleCore's own compiler configuration, then have React Laboratory consume the resulting JavaScript/declarations/package exports instead of compiling `vendor/candle-core/src/**` as application source.

This is the preferred architectural direction if practical, because a consumer should generally not impose its private TypeScript flags on library implementation source.

### Option C — Narrow validation-only bridge

If Request 027's laboratory-only constructor flag cannot be exposed through a normal built package without changing stable exports, design a minimal validation-only package/build entry that preserves the intended private experiment without making the entire CandleCore source part of React Laboratory's TypeScript compilation unit.

Do not choose an option merely because it is the smallest textual change. Choose the smallest correct package boundary.

## Workstream A — Fix the adapter type error

Audit:

`src/experiments/candle-core-lab/experimentalFullRangeAdapter.ts`

`ConstructorParameters<typeof CandleChart>[1]` can include `undefined`, while the local experimental constructor type currently requires a non-optional options object.

Fix this type mismatch without augmenting CandleCore's stable `ChartOptions` and without exporting the laboratory-only property publicly.

Possible valid strategies include normalizing undefined to `{}` at the adapter boundary or defining a constructor option type that correctly mirrors the actual constructor contract.

The desired semantics remain:

- bounded mode: do not pass `__experimentalFullRangeLod` at all;
- experimental mode: pass `__experimentalFullRangeLod: true` only through the Lab-only adapter;
- do not change stable CandleCore public typings solely for the Lab.

## Workstream B — Diagnose all TS1294 occurrences

Inspect the exact unsupported syntax in:

- `CandleRenderer.ts`
- `ExperimentalFullRangeLod.ts`
- `CoarseOhlcExtremaPyramidPrototype.ts`

Determine whether the syntax is, for example:

- parameter properties;
- enums;
- namespaces;
- other non-erasable TypeScript constructs.

Report each occurrence and whether changing it inside CandleCore would be a generally sound code-quality change or merely a consumer-specific workaround.

Do not blindly disable `erasableSyntaxOnly` in React Laboratory unless that is clearly the correct repository-wide decision and you can justify its effects on existing application code.

## Workstream C — Establish the package/build boundary

Prefer one of these outcomes, in order:

1. React Laboratory consumes CandleCore's own built JS + declarations while preserving the laboratory-only experimental path.
2. If not practical, use a narrowly scoped validation entry/build bridge.
3. Only if source consumption is explicitly intended, make the necessary CandleCore source constructs erasable-compatible.

Avoid a design where future unrelated CandleCore implementation syntax can randomly break React Laboratory because the consumer's TypeScript flags are applied transitively.

If CandleCore must be built during the Pages job, keep the process deterministic and record the exact synchronized CandleCore SHA as Request 004 already does.

## Workstream D — Preserve Request 004 provenance and pinning

Keep:

- `CANDLE_CORE_VALIDATION_REF`
- `CANDLE_CORE_READ_TOKEN`
- exact synchronized CandleCore SHA reporting
- `public/candle-core-validation-build.json`
- early verification that the selected CandleCore revision contains the experimental Full Range LOD integration

If the guard needs to change because the package boundary changes, preserve its intent.

Do not remove revision pinning to make the build easier.

## Workstream E — Avoid accidental stable API changes

This task must not turn `__experimentalFullRangeLod` into a stable public option.

Do not modify stable CandleCore API exports/signatures merely to make React Laboratory compile.

If a private/experimental package entry is needed, keep it clearly internal/laboratory-only and document that it is not part of compatibility guarantees.

## Workstream F — Build validation

The target is a successful GitHub Pages production build using the exact synchronized CandleCore revision.

At minimum run, where environment permits:

```bash
npm ci
npm run build
```

If CandleCore now has an explicit build step in the validation workflow, run and verify it using CandleCore's own configuration before React Laboratory builds.

Also validate:

- no TS1294 errors from vendored CandleCore;
- adapter TS2345 is resolved;
- Vite resolves the intended CandleCore entry;
- generated package metadata is internally consistent;
- GitHub Pages workflow YAML remains valid;
- `candle-core-validation-build.json` still records both SHAs.

## Workstream G — Lint handling

Request 004 observed existing `react-hooks/refs` lint errors in CandleCore Lab files.

Do not conflate those with this TypeScript build-boundary task.

If lint remains failing but production build succeeds, report the lint debt separately. Do not weaken lint rules as part of this task unless a change you make introduces a new lint error that must be corrected.

## Non-goals

Do not:

- change Full Range LOD algorithms;
- change base-32 pyramid behavior;
- change Navigator or Inspect semantics;
- stabilize the experimental constructor option;
- optimize performance;
- introduce Worker/Wasm/GPU logic;
- remove `erasableSyntaxOnly` merely to suppress vendor errors without architectural analysis;
- edit generated/vendor files manually in a way that will be overwritten by the next sync.

## Acceptance criteria

The task is complete when:

- `experimentalFullRangeAdapter.ts` compiles with optional constructor options correctly handled;
- CandleCore implementation source is no longer accidentally rejected by React Laboratory's `erasableSyntaxOnly` policy, either because the package boundary is corrected or because source compatibility was intentionally and safely established;
- the selected strategy is documented with rationale;
- stable CandleCore API remains unchanged;
- bounded mode remains default;
- experimental mode still passes the private flag only through the Lab adapter;
- exact CandleCore revision pinning/provenance remains intact;
- `npm run build` succeeds in a real synchronized environment;
- GitHub Pages deployment can proceed to Scenarios H–L validation.

## Decision requirement

End with one primary boundary decision:

- **BUILT PACKAGE BOUNDARY** — CandleCore owns compilation; React Laboratory consumes built output;
- **VALIDATION BRIDGE** — a narrow private build/entry is used for the experiment;
- **SOURCE COMPATIBILITY** — direct source consumption remains intentional and CandleCore source is made compatible;
- **BLOCKED** — environment limitations prevent proving a correct boundary.

Explain why the chosen result is preferable to simply disabling `erasableSyntaxOnly`.

## Documentation

Update the relevant CandleCore Lab README / validation notes with:

- how CandleCore is synchronized;
- whether source or built package is consumed;
- how the experimental flag reaches the constructor;
- which compiler owns CandleCore implementation checking;
- how the exact CandleCore SHA is recorded;
- the command/workflow required before manual Scenarios H–L.

## Final report

Report:

1. Root cause summary
2. Adapter type fix
3. TS1294 syntax findings
4. Package-boundary options considered
5. Selected boundary and rationale
6. Files/workflow changed
7. Stable API impact
8. Build/test/lint results
9. Remaining blockers before Pages Scenarios H–L
10. Primary decision
11. Commit SHA / PR metadata if available

The purpose of this request is to fix the integration boundary correctly, not merely make one CI run green. React Laboratory should be able to validate a pinned CandleCore revision without inheriting arbitrary implementation-level TypeScript incompatibilities from direct source compilation.