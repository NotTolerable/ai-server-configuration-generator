# Creator Controls Prototype (v2)

## What Creator Controls are

Creator Controls is a post-generation tuning layer for generated Minecraft mods. Instead of re-prompting for every small balance tweak, users can adjust key values directly in a no-code UI.

## Why prompt-only edits are awkward for small changes

Prompting is great for creative direction, but small adjustments (damage, cooldowns, effect duration, particles, mode toggles) can cause accidental side changes when regenerating. Creator Controls keeps those tweaks predictable.

## How this preserves the no-code flow

Users still stay in a guided web flow: generate a mod idea, then tune values with sliders/toggles/selects. No source editing, no manual config workflow.

## Why this prototype does not compile a real JAR

This is a frontend-only Vite demo. It intentionally does not run Gradle/Fabric compilation.

## How real implementation would work

In production, CreativeMode’s existing generation/build pipeline would apply tuned values and produce the updated tuned JAR.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to Vercel

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: none required
