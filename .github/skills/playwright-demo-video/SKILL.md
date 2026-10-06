---
name: playwright-demo-video
description: >
  Verify a react-laboratory experiment with Playwright and record a clear WebM
  hero video of its main user flow. Use when asked to create a demo video,
  record browser operations, show an implemented feature, or provide visual
  evidence for a 3D experiment, game, animation, or Web UI.
---

# Playwright Demo Video

## Prepare

1. Read `AGENTS.md` and `docs/ai-rules.md`. Inspect the requested experiment,
   `src/experiments/registry.ts`, routing, `package.json`, and existing tests.
2. Identify the requested behavior and 3–5 observable checkpoints. Use the
   actual UI controls; never assume a camera switch, win condition, or route
   exists. Default to a 30–60 second walkthrough, not a full test suite.
3. Install project dependencies with `npm ci` if needed. Start
   `npm run dev -- --host 127.0.0.1 --port 5173` in a managed background process.
   Respect the Vite base path: the home URL is
   `http://127.0.0.1:5173/react-laboratory/` and experiment URLs are
   `/react-laboratory/#/experiments/<id>`. Read the server output to confirm the
   port; do not replace another running server.
4. Check available tooling with `playwright-cli --help`. If a project-local
   Playwright exists, also check `npx --no-install playwright cli --help`.
   When neither is available and package installation is permitted, install
   the official CLI with `npm install -g @playwright/cli@latest`. This does
   not require changing the application's dependencies or lockfile.
5. Confirm this installed version exposes `video-start`, `video-stop`,
   `video-chapter`, and `video-show-actions`. Consult command help for options.
   Do not assume CLI recording commands are MCP tool names. If recording is
   unavailable, use the fallback below or report the environment limitation.

## Verify before recording

- Open the target URL, inspect a fresh snapshot, and explore the main flow.
  Prefer role/name or test ID locators for scripts. Refresh CLI element refs
  after navigation or significant UI changes.
- Check meaningful UI states with retry-safe assertions or locator waits.
  A visible canvas alone is insufficient: inspect a screenshot for a rendered
  scene and observe motion over time. Check console errors and failed asset
  requests; distinguish unrelated warnings from failures in the main flow.
- Follow repository rules for responsive layouts and supported themes when
  applicable; report the configurations actually checked. Record one stable
  viewport, preferably 1280×720, unless a mobile demo was requested.
- If functionality fails, report it. Fix and retest only within the task's
  authorized scope. A reproduction video may be saved as a failure artifact;
  never label it a successful demo.
- Reset the experiment through its real UI or reload before the clean take.
  Never mock application behavior or change source code to stage success.

## Record a hero video

Use a unique filename such as `<experiment>-<timestamp>.webm`. With the
same CLI session used during verification, run:

```bash
playwright-cli video-start <filename>.webm --size=1280x720
playwright-cli video-show-actions --duration=800 --position=top-right
playwright-cli video-chapter "実験名" --duration=1500
```

Perform the inspected scenario, using chapter cards only at useful transitions.
For polished pacing, first inspect the UI interactively, then write a scenario
and run `playwright-cli run-code --filename=<scenario.js>`. This accepts an
`async page => { ... }` function. Use `page.screencast` only after checking
that it exists in the installed runtime; do not assume older Playwright
packages provide it. Finish recording in `finally` when scripting.

- Hold the opening scene for about 2 seconds, demonstrate the main operation,
  let its result remain visible for 2–3 seconds, and finish on a useful view.
- Wait for observable readiness before any presentation pause. Use brief
  fixed pauses only when necessary to show motion or make a video readable;
  never use them instead of assertions or loading waits.
- Keep the viewport steady. Place annotations away from important HUDs and
  controls. Hide action annotations during long scenic sequences if useful.
- For keyboard-controlled games, focus the canvas or control surface first,
  use real keyboard input, and release held keys in `finally`.
- Protect credentials and personal information. Browser video does not
  establish that audio or synthesized speech was captured; report audio
  as unverified unless it was separately inspected.

Use these candidate scenarios only after confirming the current implementation:

| Experiment | Candidate walkthrough | Evidence to check |
| --- | --- | --- |
| `kart-rush` | Open → start → steer → race alongside AI | Race starts; vehicles move; input affects the player; visible HUD changes |
| `sea-turtle` | Open → observe swimming → use available view controls | Turtle and underwater scene render; motion is visible |
| `shiro-yado` | Open → greeting → choose a guide destination | Character renders; greeting/guide animation appears; UI responds |

Do not claim a race finish, correct AI logic, correct speech, or lip sync
solely from a short walkthrough. Verify those separately when requested.

After the final state is visible, run:

```bash
playwright-cli video-hide-actions
playwright-cli video-stop
```

Read the emitted output path (normally `.playwright-cli/<filename>.webm`).
Copy the finalized video into `artifacts/demos/<filename>.webm`; avoid
overwriting an existing artifact. Close only the session and server started
for this task, after the recorder has finalized.

## Fallback: standard Playwright video

If the CLI lacks recording but standard Playwright is available, create a
temporary Node script using `browser.newContext({ viewport: { width: 1280,
height: 720 }, recordVideo: { dir: <temporary-directory>, size: { width:
1280, height: 720 } } })`. Operate and assert the same inspected scenario.
Retain `page.video()`, close the context in `finally` to finalize the recording,
then use `video.saveAs(<artifact-path>)` before closing the browser. Reuse
installed tooling; do not modify the shared Playwright config for this task.
Report that chapters/action annotations were unavailable in this fallback.
If neither backend is usable, report the exact blocker without claiming a video.

## Validate and report

1. Confirm the finalized file exists and is non-empty. If available, inspect
   duration and resolution with `ffprobe` and review extracted beginning,
   middle, and end frames or play the video. Check for black/frozen scenes,
   incorrect routes, and overlays covering important content. A non-empty
   file alone does not prove a usable recording. State any review limitation.
2. Save a concise sibling `<filename>.md` with the scenario, actual checks and
   outcomes, viewport, URL, recording backend/version, and unresolved issues.
3. Store curated recordings under `artifacts/demos/YYYY-MM-DD/` with a sibling
   Markdown report, following the root README. Commit requested curated videos;
   keep temporary takes, traces, and browser state out of source commits.
   Use the execution environment's artifact mechanism when
   available; provide real downloadable links only after upload succeeds.
   In a PR, summarize checks and link accessible artifacts, never a local path
   presented as a downloadable attachment. Keep each curated clip short and compact; use external artifacts for long recordings.
4. Return a short Japanese report: demonstrated scenario, checks passed or
   failed, video location/link, and limitations. Distinguish inspection from
   automated assertions and do not claim broader test coverage.

## Official references

Check these when installed command syntax or capabilities differ:

- CLI setup: https://playwright.dev/agent-cli/installation
- Recording/chapters/actions: https://playwright.dev/agent-cli/commands/video-recording
- Official CLI skill: https://playwright.dev/agent-cli/skills
- Standard recording: https://playwright.dev/docs/videos
- Copilot skills: https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills

## Invocation example

「playwright-demo-video Skillを使って、海中レースの開始・操作・AI車両との
走行を確認し、30〜60秒のデモ動画を artifacts/demos/ に保存してください。」
