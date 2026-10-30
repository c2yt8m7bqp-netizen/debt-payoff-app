# Debt Payoff

A beginner-friendly phone app to help pay off credit card debt (avalanche vs snowball later). Built with **Expo** + **TypeScript** so one codebase runs on iPhone and Android.

## What this step is / is not

**This step (Phase 1, steps 1–2):**

- An empty Expo TypeScript project you can open on a phone with Expo Go
- One home screen with the app name and a short subtitle

**Not yet:**

- Credit card forms, SQLite storage, or payoff math
- Accounts, cloud sync, or a backend

Money data will stay on-device in later steps. This step has no financial data.

## Why Expo?

Expo is a managed React Native toolkit. You write TypeScript once and try the app on a real phone with **Expo Go** — no Mac App Store build for early review. That matches a phone-sized learning workflow.

## Run on an iPhone (Expo Go)

1. On your iPhone, install **Expo Go** from the App Store.
2. On your computer (in this project folder), install dependencies if needed, then start the project:

   ```bash
   npm install
   npx expo start
   ```

3. Scan the QR code shown in the terminal with your iPhone Camera (or inside Expo Go). The app should open in Expo Go on the same Wi‑Fi network as your computer.

**Tip:** If the QR code won’t connect, make sure phone and computer are on the same network, or try the tunnel option: `npx expo start --tunnel`.

## Other scripts

```bash
npm start          # same as npx expo start
npm run android    # open on Android emulator / device tooling
npm run ios        # needs macOS for a simulator; Expo Go still works without a Mac
npm run web        # optional browser preview
```
