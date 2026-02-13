# xOS

**The CEO Operating System** — A decision-first, pressure-tested operating layer that sits above all tools, projects, and people.

## Overview

xOS is designed for executives who don't need another task list. It surfaces only what matters: **decisions**, **slippage**, and **leverage**.

See [CONCEPT.md](./CONCEPT.md) for the full product concept and vision.

## App

The app lives in **`apps/xos`** (Next.js 14, Bun, Neon, WorkOS). See [apps/xos/README.md](./apps/xos/README.md) for local dev, deploy, and webhooks.

## Repo setup (first time on GitHub)

1. **Create a new repository** on GitHub (e.g. `your-org/xos`). Do *not* add a README, .gitignore, or license so the repo is empty.

2. **From this folder:**

   ```bash
   git init
   git add .
   git commit -m "Initial commit: xOS app (Bun, Next.js, Neon, WorkOS)"
   git branch -M main
   git remote add origin https://github.com/YOUR_ORG/xos.git
   git push -u origin main
   ```

   Replace `YOUR_ORG/xos` with your repo (e.g. `jaredlutz/xos`).

3. **Optional:** In GitHub repo **Settings → Secrets and variables → Actions**, add any secrets you need for deploy (e.g. Vercel, Neon); the app’s CI only runs lint and test.
