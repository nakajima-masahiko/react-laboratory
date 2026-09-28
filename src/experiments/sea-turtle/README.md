# 蒼海を旅するアオウミガメ

Route: `#/experiments/sea-turtle`

Initial interactive prototype: original procedural turtle, articulated front flippers,
orbit/follow/detail cameras, 24-second scripted surfacing cycle, pause, part picking,
underwater fog, shader-based floor caustics, moving sea grass, instanced distant fish,
floating particles and opt-in synthesized underwater ambience. Mouse and touch use
OrbitControls. All toolbar actions are native buttons, detail selection is keyboard
accessible. Reduced motion disables idle orbit and slows movement.

## Asset boundary and known limitations

`model.ts` owns the original model and texture. No downloaded animal assets are used.
This is an explicitly labelled simplified model, not a scan or anatomically exact
reconstruction. The shell texture is decorative rather than an exact scute map.
`scene.ts` owns rendering, animation, camera, picking and GPU cleanup; `index.tsx`
owns accessible controls and audio lifecycle. Existing R3F dependencies are not
required; this scene uses the repository's Three.js directly.

Not implemented: production photorealistic GLB, GLTF/Draco/KTX2 loading pipeline,
skeletal clip blending, LOD tiers, 2K/4K texture switching, true volumetric god rays,
coral, fish-tail articulation, camera-reactive eyes, real water-surface physics,
automatic ecological breathing intervals, static image fallback, full sourced
species fact sheet. Light mode disables caustics and particles only. Renderer DPR
is capped at 1.5; mobile frame rate is not guaranteed without device testing.

A replacement GLB must be licensed for public redistribution, centered at the origin,
point forward on -Z with +Y up, and be scaled to the existing turtle envelope. Add a
loader/mixer with progress and failure handling before replacing the procedural asset.

## Validation

- Feature ESLint and isolated TypeScript checks.
- Browser test: `tests/browser/sea-turtle.spec.ts` (desktop and mobile viewport).
- Full build requires the existing private `candle-core` dependency and its configured
  `CANDLE_CORE_READ_TOKEN`. Without that token, prebuild and repository-wide type checks
  are blocked by the existing dependency; do not replace or stub it to claim success.

No library behavior workaround was needed. Browser automation may require installing
the Chromium revision matching the available Playwright package.
