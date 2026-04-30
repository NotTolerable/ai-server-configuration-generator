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

## 4) Vercel deployment guide
This app is a static Vite frontend (no backend, no environment variables).

### Option A: Deploy from Git (recommended)
1. Push this repository to GitHub/GitLab/Bitbucket.
2. In Vercel, click **Add New... → Project**.
3. Import your repository.
4. Use these build settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Keep Environment Variables empty.
6. Click **Deploy**.
7. After deployment, each new commit to the connected branch will trigger a fresh build.

### Option B: Deploy with Vercel CLI
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. From project root, run:
   ```bash
   vercel
   ```
3. Follow prompts:
   - Link/create Vercel project
   - Confirm settings (build: `npm run build`, output: `dist`)
4. For production deployment:
   ```bash
   vercel --prod
   ```

### Troubleshooting
- If build fails, run `npm install` then `npm run build` locally and fix TypeScript/build errors first.
- If Vercel cannot find output files, confirm output directory is exactly `dist`.

## 5) Out-of-scope items
- No Minecraft plugin/server integration.
- No authentication, accounts, or payment systems.
- No backend API/database.
- No external AI API calls.
