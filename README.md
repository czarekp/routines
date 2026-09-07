# Routines

A private, phone-first PWA for daily routines. It is a quiet checklist for the
small gaps of a real day — before leaving home, after the gym, in the morning, or
before bed. No accounts, no history, no gamification, no notifications. Just the
steps you want to keep close, and a checkmark next to each one.

Everything lives in your browser. There is no backend and no network call, so the
app works offline and keeps your routines to yourself.

## Features

- **Daily checklists.** Create routines, each a short ordered list of steps.
- **Automatic daily reset.** Checkmarks clear on their own at the start of a new
  day; your steps stay exactly as you left them.
- **Reorder by dragging.** Steps move with a drag handle (touch-friendly).
- **Progress at a glance.** A small ring shows how many steps are done.
- **Installable.** Add it to your home screen and launch it like a native app.
- **Polish and English.** A built-in language toggle (Polish by default).

## Tech stack

- **Next.js 16** (App Router) with a fully **static export** — no server at runtime.
- **React 19** and **TypeScript**.
- **Tailwind CSS v4** with design tokens; **shadcn** (`base-nova`) components on
  **@base-ui/react** primitives; icons from **lucide-react**.
- **@dnd-kit** for step reordering.
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
- **i18n.** `next-intl`, forced to Polish server-side, plus a client pl/en toggle
  (`src/components/i18n-provider.tsx`). Catalogs are `messages/pl.json` and
  `messages/en.json` — keep both in sync when adding keys.
- **Mobile gate + PWA.** `src/components/mobile-gate.tsx` renders the app for
  mobile viewports (and a short "desktop not supported" message otherwise) and
  registers the service worker (`public/sw.js`).

## Product

See [`PRODUCT.md`](PRODUCT.md) for the design intent: a calm, quiet checklist.
Keep the UI restrained — warmth belongs to the coral accent alone.
