# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Design principles

This stack (and every app built on it) is guided by a few core goals. Keep
them in mind when writing or reviewing code:

- **Minimalism.** Prefer the simplest solution; avoid unnecessary
  abstractions, UI complexity, or dependencies.
- **Independence.** Avoid vendor/cloud lock-in — don't reach for a backend or
  third-party service where a local-first approach works.
- **Smallest possible runtime footprint.** Keep bundle sizes and components
  lightweight to reduce battery/resource usage on the user's device — e.g.
  prefer true black (`#000000`) backgrounds, which save power on OLED screens.
  This is about the shipped app's runtime behavior, not the footprint of
  building it — the project is developed with Claude Code, which has its own
  energy cost (see README's "Built with Claude").
- **Ease of use.** Favor solutions that keep the app simple and predictable
  for the user.
- **Accessibility.** Keep components accessible — semantic markup,
  keyboard/screen-reader support, sufficient contrast.

## Commands

- `npm run dev` — local dev server (Vite, serves under `/routines/`, see below).
- `npm run build` — `tsc -b && vite build`, output to `dist/`. This is also the
  deploy build.
- `npm run lint` / `npm run lint:fix` — ESLint (flat config, `eslint.config.mjs`).
- `npm run format:check` / `npm run format` — Prettier. Prettier also runs _as an
  ESLint rule_ (`prettier/prettier: error`), so a formatting slip fails lint too.
- `npm run typecheck` — `tsc -b` (project references: `tsconfig.app.json` for
  `src/`, `tsconfig.node.json` for `vite.config.ts`).
- `npm run validate` — lint + format:check + typecheck + build + `npm audit`; the
  same gates CI runs. `npm run validate:fix` applies the autofixable ones.
- `npm run build:analyze` — same production build, plus `dist/stats.html`, a
  `rollup-plugin-visualizer` treemap of what's inside each chunk (opens
  automatically). Wraps `npm run build` in `cross-env ANALYZE=1` so it works
  the same in PowerShell and bash; opt-in only — plain `npm run build` never
  runs it.

There is no test suite.

## Architecture

A private, phone-first PWA for daily checklists. No accounts and no backend —
everything lives in the browser, and nothing about the user leaves the device.
The only network traffic is the service worker fetching the app's own files.

- **Vite + base path, no server.** `vite.config.ts` sets `base: "/routines/"`
  (deployed to GitHub Pages under `/routines`) and builds a plain static SPA —
  no server at runtime. GitHub Pages has no server-side rewrites, so a hard
  refresh or deep link into a client-routed path would 404; a `closeBundle`
  plugin in `vite.config.ts` copies the built `index.html` to `dist/404.html`
  after every build so Pages' 404 fallback boots the app instead. Every
  absolute in-app URL (service worker registration, manifest, icons) must stay
  root-relative so Vite can rewrite it with the `/routines/` prefix at build time.

- **State = localStorage only.** `src/lib/storage.ts` is the single source of
  truth, persisting one JSON blob under the `routines-data` key. All reads go
  through `normalizeState`, which **resets each routine's checked steps when its
  `lastResetDate` is not today** — the daily-reset behavior is a side effect of
  reading, not a scheduled job. Every accessor is guarded for a non-browser
  environment (`typeof window === "undefined"` returns empty data), so first
  render is empty and real data appears after mount. Types are in `src/types.ts`.
  Every localStorage key the app owns is declared in `src/lib/storage-keys.ts`
  — add new ones there so backup and reset stay in step. `lib/` never imports
  from `react`/`react-dom`; React hooks that wrap this state live in `src/hooks/`
  (`use-store.ts`, `use-install-prompt.ts`) instead.

- **Routing pattern.** `src/views/<name>/` holds one folder per screen;
  `src/app/router.tsx` maps them to routes with React Router
  (`<BrowserRouter basename="/routines">`), and each view is `lazy()`-loaded as
  its own chunk. Views read the target id from the `?id=` search param via
  `useSearchParams`. Navigation is plain `navigate(...)` between `/`,
  `/routine?id=`, `/routine/edit?id=`, and `/new`. Settings is a drawer opened
  from the home view's state, not a route — `src/views/home/settings-panel.tsx`.
  A component used by 2+ views lives in `src/components/` instead of a view
  folder (e.g. `app-bar.tsx`, `routine-edit-form.tsx`, `missing-routine.tsx`).

- **i18n is a small custom hook, not a library.** `src/i18n/use-translation.ts`
  is a `useSyncExternalStore`-backed locale store — detects the device language
  on first launch (`navigator.language`), then remembers the choice in
  `localStorage` under `routines-locale` — plus a `t(key, params?)` function
  doing `{placeholder}` substitution. No provider is needed; the store is a
  module-level singleton. Message catalogs are `src/i18n/en.json` and
  `src/i18n/pl.json` — keep both in sync when adding keys. Dates are formatted
  with native `Intl.DateTimeFormat`.

- **Mobile gate + app lock.** `src/components/mobile-gate.tsx` renders the app
  for mobile viewports and a "desktop not supported" message otherwise, and
  registers the service worker (production builds only — see the
  `import.meta.env.PROD` guard; there's no `sw.js` in dev, and running a
  caching worker during development would fight Vite's HMR anyway). Inside it,
  `src/components/app-lock-gate.tsx` hides the app behind a WebAuthn
  platform-authenticator prompt when the lock is on. Being unlocked is
  per-session memory state in `src/lib/app-lock.ts`; enrolling counts as
  unlocked, or turning the switch on would lock the user out on the spot. The
  lock is a gate, **not** encryption — there is no backend to verify the
  assertion and `routines-data` stays readable — so the lock screen always
  keeps an escape hatch once the authenticator fails or goes missing.

- **Service worker (`src/sw.ts`, built by vite-plugin-pwa).** The
  `injectManifest` strategy compiles this file and substitutes
  `self.__WB_MANIFEST` with the list of content-hashed build assets, which the
  worker precaches itself at install time — everything past that point
  (network-first navigations so a deploy lands on the next launch,
  cache-first for everything else) is the same hand-written logic the old
  Next.js `public/sw.js` had. Bump `CACHE_NAME` when the shell changes.
  Settings' "Update app" (`src/lib/app-update.ts`) takes a backup, drops every
  cache, tells a waiting worker to activate, then reloads.

- **Backup + settings.** `src/lib/backup.ts` serialises routines, progress and
  the language to a versioned JSON file and validates anything imported (the
  file is user-supplied — unrecognised entries are dropped, not trusted).
  `src/lib/settings.ts` holds preferences (currently the lock enrolment) in
  the same external-store shape as `use-store.ts`; `resetPreferences` clears
  preferences only and callers must reload, since other stores cache their own
  snapshots.

- **UI stack.** shadcn (`base-nova` style, see `components.json`, `rsc: false`)
  built on `@base-ui/react` — primitives live in `src/components/ui`, generated
  and not hand-edited. Tailwind v4 (via `@tailwindcss/postcss`) with design
  tokens in `src/app/globals.css`; icons from `lucide-react`. Fonts are
  self-hosted via `@fontsource-variable/inter` and `@fontsource-variable/figtree`
  (imported in `src/main.tsx`) rather than fetched from Google Fonts at
  runtime — same "nothing leaves the device" invariant the old `next/font`
  setup gave for free. Step reordering uses `@dnd-kit`.
  Every bottom sheet is `src/components/ui/drawer.tsx` (Base UI `Drawer`) with
  `showSwipeHandle`, so each one has a grab pill and can be swiped down to
  dismiss. Base UI stacks nested drawers — opening a confirmation from the
  settings drawer shrinks and scales the parent behind it, which is intended.
  The drawer reacts to touch gestures, so e2e swipes need CDP
  `Input.dispatchTouchEvent`; synthetic mouse drags do not dismiss it.
  Every drawer also closes on the phone's native back button/gesture, the
  same as its swipe handle or close control. On Android/Chromium this is
  Base UI's own doing (`CloseWatcher`, gated to the topmost open drawer —
  see `DrawerRoot.js`); `drawer.tsx` adds a `useHistoryBackDismiss` fallback
  on top (one `pushState` per open drawer, closed via `popstate`, marker-
  tagged so nested drawers only close the topmost) to cover iOS and any
  browser without `CloseWatcher`. Routed screens (routine view/edit, `/new`)
  need no equivalent — `navigate(...)` already gives them a real history
  entry, so native back lands wherever the `AppBar` arrow would.

## Product context

See `PRODUCT.md` for the design intent: a calm, quiet checklist — no history,
gamification, or notifications. Keep the UI restrained: the accent is a neutral
**white** on dark surfaces. The earlier coral accent was removed deliberately —
do not reintroduce it.

<!-- BEGIN AUTO-GENERATED: setup-claude-workflow -->

## Automation

| Purpose    | npm script          | Runs automatically via            |
| ---------- | ------------------- | --------------------------------- |
| Format     | `npm run format`    | PostToolUse hook, per edited file |
| Lint (fix) | `npm run lint:fix`  | PostToolUse hook, per edited file |
| Typecheck  | `npm run typecheck` | Stop hook, summary only           |

No test script exists — `/check` runs format:check, lint, typecheck, build only.

## Conventions

- Filenames: kebab-case everywhere, including components (not PascalCase);
  component names inside a file are still PascalCase (`routine-view.tsx`
  exports `RoutineView`).
- Named exports throughout; no framework forces a default export here.
- Hooks (`use*`) live in `src/hooks/`, not in `src/lib` — `lib/` must stay
  free of `react`/`react-dom` imports.
- View-level UI lives in `src/views/<name>/`; `src/components/` is for UI
  shared by 2+ views only (gates, `app-bar.tsx`, `ui/` primitives).
- Full pattern log: `.claude/docs/patterns.md` — read by `/find-antipatterns`
  and `/learn-patterns`, not loaded every session.

## Workflow Rules

- Formatting and lint --fix run automatically after every file edit via
  hooks — don't manually re-run them or narrate that you're about to.
- Before calling a task done, run `/check`.
- Prefer `Grep`/`Glob` over reading whole files; read only what a task needs.
- For broad codebase audits, use `/find-antipatterns` instead of reading many
  files inline.
- After a non-trivial session, run `/learn-patterns` to record what recurred.

<!-- END AUTO-GENERATED: setup-claude-workflow -->
