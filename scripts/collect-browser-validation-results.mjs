import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const artifactRoot = resolve('validation-artifacts');
const resultRoot = join(artifactRoot, 'results');
mkdirSync(resultRoot, { recursive: true });
const scenarios = existsSync(resultRoot)
  ? readdirSync(resultRoot).filter(name => name.endsWith('.json')).sort().map(name => JSON.parse(readFileSync(join(resultRoot, name), 'utf8')))
  : [];
const provenancePath = resolve('public/candle-core-validation-build.json');
const provenance = existsSync(provenancePath) ? JSON.parse(readFileSync(provenancePath, 'utf8')) : {};
const playwrightResultPath = join(artifactRoot, 'playwright-results.json');
const playwrightResult = existsSync(playwrightResultPath) ? JSON.parse(readFileSync(playwrightResultPath, 'utf8')) : null;
const playwrightPassed = playwrightResult?.stats
  ? playwrightResult.stats.unexpected === 0 && playwrightResult.stats.expected > 0
  : false;
const result = {
  generatedAt: new Date().toISOString(),
  reactLaboratorySha: process.env.REACT_LABORATORY_SHA || provenance.reactLaboratorySha || null,
  candleCoreSha: process.env.CANDLE_CORE_SHA || provenance.candleCoreSha || null,
  workflowRunId: process.env.GITHUB_RUN_ID || null,
  workflowRunUrl: process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : null,
  scenarios,
  playwrightSummary: playwrightResult?.stats ?? null,
  automatedDecision: playwrightPassed && scenarios.length === 4 && scenarios.every(scenario => scenario.status === 'passed')
    ? 'CI BROWSER VALIDATION PASSED' : 'REWORK',
  humanValidationRequired: [
    'Pan/zoom smoothness and direct-to-LOD visual transition continuity',
    'Canonical source-candle identity in the canvas Inspect tooltip',
    'Spike preservation, first-open/last-close direction, and series rendering artifacts',
  ],
};
writeFileSync(join(artifactRoot, 'results.json'), `${JSON.stringify(result, null, 2)}\n`);
