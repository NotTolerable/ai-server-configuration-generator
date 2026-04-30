# Creator Controls Prototype

## What Creator Controls are
Creator Controls are an optional post-generation tuning layer for CreativeMode-style Minecraft mods. After a mod is generated, the app scans generated output and exposes safe, no-code controls (sliders/toggles/selects) for balancing and multiplayer safety.

## Why prompt-only edits can be awkward
Prompting is great for major feature iteration, but small tuning changes (cooldowns, damage bonuses, AoE caps, effect durations) often need quick, repeatable adjustments. Creator Controls make those micro-adjustments faster and clearer.

## How this preserves the no-code CreativeMode experience
The user edits controls in the web UI instead of touching source files manually. The prototype shows control schema, config-style output, and code refactor previews to keep tuning understandable without coding.

## Why this prototype does not compile real JARs
This project is frontend-only and Vercel-ready. It does not run Fabric toolchains, Gradle builds, or server-side compilation.

## How real tuned JAR rebuilds would happen
In CreativeMode production architecture, control values would be sent to the existing generation/build pipeline, where source updates and real Fabric JAR rebuilds occur.

## Local run
```bash
npm install
npm run dev
```
Production check:
```bash
npm run build
```

## Vercel deployment
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: none required
