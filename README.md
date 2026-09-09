# Routines

A private, phone-first PWA for daily routines. It is a quiet checklist for the
small gaps of a real day — before leaving home, after the gym, in the morning, or
before bed. No accounts, no history, no gamification, no notifications. Just the
steps you want to keep close, and a checkmark next to each one.

Everything lives in your browser. There is no backend and no account, nothing
about you is sent anywhere, and the app works offline — the only requests it
makes are for its own files.

## Design principles

This project — and this stack in general — is guided by a few core goals:

- **Minimalism.** No more than the checklist needs; a calm, uncluttered UI.
- **Independence.** No accounts, no cloud, no vendor lock-in — your data stays
  yours and stays on your device.
- **Smallest possible carbon footprint.** Lightweight and easy on the battery,
  e.g. true black (`#000000`) backgrounds to save power on OLED screens.
- **Ease of use.** Simple enough to use without thinking about it.
- **Accessibility.** Usable by as many people as possible.

## Features

- **Daily checklists.** Create routines, each a short ordered list of steps.
- **Automatic daily reset.** Checkmarks clear on their own at the start of a new
  day; your steps stay exactly as you left them.
- **Reorder by dragging.** Steps move with a drag handle (touch-friendly).
- **Progress at a glance.** A small ring shows how many steps are done.
- **Installable.** Add it to your home screen and launch it like a native app.
- **English and Polish.** A built-in language toggle (English by default); your
  choice is remembered on the device via `localStorage`.
- **Reorder routines.** Drag routines on the main list into the order you want.
- **Export and import.** Save every routine to a JSON file and restore it
  later — the way to move your data to another device or browser.
- **Install and update from Settings.** An install button (where the browser
  offers one) and an update button that clears caches, takes an automatic
  backup first, and reloads.
- **App lock.** An optional fingerprint/face prompt before the app opens,
  using the device's WebAuthn platform authenticator. It is a convenience
  gate, not encryption — see the note below.
- **Reset settings.** Puts language and app lock back to their defaults and
  leaves your routines alone.

### About the app lock

The lock registers a WebAuthn platform credential and asks for it before
showing your routines. Because there is no backend, nothing verifies the
assertion and your routines stay readable in `localStorage` — it keeps a
passer-by out of an unlocked phone, it does not protect the data itself. If
the authenticator ever stops working (a new phone, cleared browser data,
re-enrolled biometrics), the lock screen offers a way to turn the lock off so
you are never shut out of your own checklist.

## Tech stack

- **Next.js 16** (App Router) with a fully **static export** — no server at runtime.
- **React 19** and **TypeScript**.
- **Tailwind CSS v4** with design tokens; **shadcn** (`base-nova`) components on
  **@base-ui/react** primitives; icons from **lucide-react**.
- **@dnd-kit** for step and routine reordering.
- **next-intl** for translations.
- State persisted to **`localStorage`** (no database, no API).

## Local development

```bash
npm install
npm run dev      # dev server (note the /routines base path, see below)
```

Other useful scripts:

```bash
npm run build         # static export to out/ (also the deploy build)
npm run lint          # ESLint (Prettier runs as a lint rule, so format slips fail lint)
npm run format        # Prettier --write
npm run format:check  # Prettier --check
npm run typecheck     # tsc --noEmit
npm run validate      # lint + format:check + typecheck + build + npm audit
```

There is no test suite.

## Deployment (static export + `/routines` base path)

The app is deployed to **GitHub Pages** as a static site.

- `next.config.ts` sets `output: "export"`, so `npm run build` writes a fully
  static site to `out/` — no server, route handlers, or dynamic SSR at runtime.
- It also sets `basePath: "/routines"` because the site is served from a project
  Pages URL (`https://<user>.github.io/routines/`). Every absolute in-app URL
  (service worker, manifest, icons) includes the `/routines` prefix, and the dev
  server serves the app under `/routines` too.
- Deployment is automated in `.github/workflows/deploy.yml`: on push to `main` it
  builds the static export, uploads it as a Pages artifact, and deploys it. A
  separate `.github/workflows/validate.yml` runs lint, format check, and typecheck
  on every push to any branch.

> **One-time repo setting:** in **Settings → Pages**, the build and deployment
> **Source** must be set to **"GitHub Actions"** for the deploy workflow to
> publish. The workflow also calls `actions/configure-pages` with
> `enablement: true` to enable Pages programmatically.

## Architecture

- **State is `localStorage` only.** `src/lib/storage.ts` is the single source of
  truth, persisting one JSON blob under the `routines-data` key. Reads go through
  `normalizeState`, which resets a routine's checked steps whenever its
  `lastResetDate` is not today — the daily reset is a side effect of reading, not
  a scheduled job. Accessors are SSR-guarded, so first render is empty and real
  data appears after mount. Types live in `src/types.ts`.
- **Routing.** `src/app/**/page.tsx` files are thin wrappers; the real screens are
  the `*Route` client components in
  `src/app/routine/_components/routine-routes.tsx`. They load the relevant routine
  from storage and read the target id from the `?id=` search param. Navigation is
  plain `router.push` between `/`, `/routine?id=`, `/routine/edit?id=`, `/new`, and
  `/settings`.
- **i18n.** `next-intl`, rendered in English server-side, plus a client en/pl
  toggle (`src/components/i18n-provider.tsx`) whose choice is persisted to
  `localStorage` (`routines-locale`) and applied after mount. Catalogs are
  `messages/en.json` and `messages/pl.json` — keep both in sync when adding keys.
- **Mobile gate + app lock.** `src/components/mobile-gate.tsx` renders the app
  for mobile viewports (and a short "desktop not supported" message otherwise)
  and registers the service worker. Inside it,
  `src/components/app-lock-gate.tsx` holds the app behind the WebAuthn prompt
  while the lock is on; being unlocked is per-session state in
  `src/lib/app-lock.ts`.
- **Service worker (`public/sw.js`).** Navigations are network-first, so a new
  deploy is picked up on the next launch and the cache is the offline fallback;
  content-hashed assets stay cache-first. Settings' "Update app"
  (`src/lib/app-update.ts`) snapshots your routines, clears every cache and
  reloads.
- **Backup + preferences.** `src/lib/backup.ts` writes and validates the
  versioned export/import file; `src/lib/settings.ts` stores preferences (the
  lock enrolment). Every `localStorage` key the app owns is declared in
  `src/lib/storage-keys.ts`, so backup and reset stay in step.

## Product

See [`PRODUCT.md`](PRODUCT.md) for the design intent: a calm, quiet checklist.
Keep the UI minimalistic — the accent is a clean, neutral white on dark surfaces.

## Built with Claude

This project is developed with [Claude Code](https://claude.com/claude-code),
Anthropic's agentic coding tool. Features and refactors are implemented in
pair-programming sessions with Claude, then reviewed and committed by a human.
