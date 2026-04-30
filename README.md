# Creator Controls Demo (UI Mockup)

Frontend-only React + Vite + TypeScript prototype that recreates a CreativeMode-style generated mod detail page layout for private product mockup/testing.

## What this prototype includes
- Dark, compact, monospace UI theme inspired by the provided screenshot.
- Generated mod detail page sections (top nav, title/meta, preview cards, tabs, edit panel, sidebar cards, version history, tutorial toast).
- Placeholder branding only (`Creator Controls Demo`) and no copied brand assets.

## Constraints
- No backend, auth, database, API calls, or payments.
- No environment variables.
- No real JAR compilation.
- Static frontend deployable on Vercel.

## Run locally
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
```

## Vercel deployment
- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
