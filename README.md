# Minecraft Mod Configurator (Prototype)

## 1) Project description
Minecraft Mod Configurator is a frontend-only demo that scans generated Minecraft mod text and turns it into editable, server-ready configuration controls.

## 2) Why this matters
Generated mod ideas are creative, but multiplayer servers need operational controls (permissions, world restrictions, cooldowns, caps, and performance safeguards). This prototype demonstrates a deterministic post-generation analysis layer that server owners can tune.

## 3) Local run instructions
```bash
npm install
npm run dev
```
Then open the Vite URL shown in your terminal.

To verify production build:
```bash
npm run build
```

## 4) Vercel deployment notes
- This app is a static Vite frontend with no backend.
- Build command: `npm run build`
- Output directory: `dist`
- No environment variables are required.
- No Node-only runtime code is used in browser components.

## 5) Out-of-scope items
- No Minecraft plugin/server integration.
- No authentication, accounts, or payment systems.
- No backend API/database.
- No external AI API calls.
