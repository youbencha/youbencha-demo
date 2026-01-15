# Model Output Comparison: To-Do PWA Builds

## Quick Read
- **Gemini 3 Pro** – Minimalist, single-file JS, inline event handlers; straightforward localStorage state; light cache-first SW; sparse manifest/icons.
- **GPT-5.1-Codex** – Modular ES modules (`app/db/utils`), template-driven rendering, robust UX feedback and network awareness; network-first SW with offline fallback; rich dark/light theming.
- **Opus 4.5** – Classic script style with a dedicated `TodoDB`; heavy UI chrome (sidebar, dialogs, toasts), keyboard shortcuts; cache-first SW with root-scoped URLs.
- **Sonnet 4.5** – String-template rendering with per-element listeners; dropdown list picker + bottom input bar; pragmatic cache-first SW with dynamic base URL handling.

## Per-Model Notes

### Gemini 3 Pro
- Structure: Single script with global functions and inline `onchange/onclick` bindings in rendered HTML ([todo-pwa-gemini3pro-2026-01-09-1767932590948/src-modified/js/app.js](todo-pwa-gemini3pro-2026-01-09-1767932590948/src-modified/js/app.js)). No modules or helpers.
- State: Single `state` object with lists and tasks stored together; simple `localStorage` persistence with minimal validation.
- UI: Basic sidebar + task pane; uses native `<dialog>` for list creation; lightweight styling focused on desktop layout ([todo-pwa-gemini3pro-2026-01-09-1767932590948/src-modified/css/styles.css](todo-pwa-gemini3pro-2026-01-09-1767932590948/src-modified/css/styles.css)).
- Offline: Cache-first SW caching only core shell assets, no offline fallback ([todo-pwa-gemini3pro-2026-01-09-1767932590948/src-modified/sw.js](todo-pwa-gemini3pro-2026-01-09-1767932590948/src-modified/sw.js)). Single SVG icon declared for both sizes in manifest.

### GPT-5.1-Codex
- Structure: ES modules with clear separation of concerns (`app.js`, `db.js`, `utils.js`); template cloning for tasks; delegated event handling ([todo-pwa-gpt51-codex-2026-01-09-1767934333339/src-modified/js/app.js](todo-pwa-gpt51-codex-2026-01-09-1767934333339/src-modified/js/app.js)).
- State: Normalized store with lists array and `tasks` map; validation/normalize on load; storage availability checks and cross-tab sync via `storage` event ([todo-pwa-gpt51-codex-2026-01-09-1767934333339/src-modified/js/db.js](todo-pwa-gpt51-codex-2026-01-09-1767934333339/src-modified/js/db.js)).
- UX/Accessibility: Rich feedback (status pill, toast-like messages), editable tasks with contentEditable, keyboard-friendly; semantic template for tasks; dark/light adaptive theming and polished layout ([todo-pwa-gpt51-codex-2026-01-09-1767934333339/src-modified/css/styles.css](todo-pwa-gpt51-codex-2026-01-09-1767934333339/src-modified/css/styles.css)).
- Offline: Network-first for navigation with offline fallback page, cache-first for same-origin assets; versioned cache and offline HTML ([todo-pwa-gpt51-codex-2026-01-09-1767934333339/src-modified/sw.js](todo-pwa-gpt51-codex-2026-01-09-1767934333339/src-modified/sw.js)).
- Manifest: Maskable icons, color-scheme metadata, polished naming ([todo-pwa-gpt51-codex-2026-01-09-1767934333339/src-modified/manifest.json](todo-pwa-gpt51-codex-2026-01-09-1767934333339/src-modified/manifest.json)).

### Opus 4.5
- Structure: Imperative script with centralized DOM map and `TodoDB` singleton module for persistence ([todo-pwa-opus45-2026-01-10-1768024890726/src-modified/js/app.js](todo-pwa-opus45-2026-01-10-1768024890726/src-modified/js/app.js), [todo-pwa-opus45-2026-01-10-1768024890726/src-modified/js/db.js](todo-pwa-opus45-2026-01-10-1768024890726/src-modified/js/db.js)).
- State: Lists embed tasks; storage migrations stubbed; throws helpful quota errors; active list tracked in storage.
- UI: Desktop-first sidebar with overlay, dialogs for CRUD, toast notifications, keyboard shortcuts; renders add-task form via injected HTML near list content; extensive styling variables and responsive handling ([todo-pwa-opus45-2026-01-10-1768024890726/src-modified/css/styles.css](todo-pwa-opus45-2026-01-10-1768024890726/src-modified/css/styles.css)).
- Offline: Cache-first SW with root-anchored URLs (absolute `/` paths may fail under subpath deploy) and basic navigate fallback to index ([todo-pwa-opus45-2026-01-10-1768024890726/src-modified/sw.js](todo-pwa-opus45-2026-01-10-1768024890726/src-modified/sw.js)).
- Manifest: Comprehensive icon set and shortcut; start/scope at root ([todo-pwa-opus45-2026-01-10-1768024890726/src-modified/manifest.json](todo-pwa-opus45-2026-01-10-1768024890726/src-modified/manifest.json)).

### Sonnet 4.5
- Structure: Single script using string templates for rendering lists/tasks and per-element listeners; no separate DB helper ([todo-pwa-sonnet45-2026-01-09-1767935675496/src-modified/js/app.js](todo-pwa-sonnet45-2026-01-09-1767935675496/src-modified/js/app.js)).
- State: Separate arrays for lists and tasks; simple `localStorage` keys per entity and current list; confirm dialog callback pattern for destructive actions.
- UI: Header list selector with dropdown, floating add-task bar at bottom, modals for list CRUD/confirm; strong animation/visual polish in CSS ([todo-pwa-sonnet45-2026-01-09-1767935675496/src-modified/css/styles.css](todo-pwa-sonnet45-2026-01-09-1767935675496/src-modified/css/styles.css)).
- Offline: Cache-first SW with dynamic base URL helper to support subpath installs; caches shell assets only ([todo-pwa-sonnet45-2026-01-09-1767935675496/src-modified/sw.js](todo-pwa-sonnet45-2026-01-09-1767935675496/src-modified/sw.js)).
- Manifest: Full icon matrix with shortcuts; scoped to `./` ([todo-pwa-sonnet45-2026-01-09-1767935675496/src-modified/manifest.json](todo-pwa-sonnet45-2026-01-09-1767935675496/src-modified/manifest.json)).

## Comparative Themes
- **Architecture:** GPT-5.1-Codex is the only ES-module build with normalization helpers; Opus uses a DB singleton; Gemini and Sonnet keep everything in one script without modules.
- **Rendering pattern:** Codex uses template cloning and event delegation; Opus mixes `innerHTML` and post-bind listeners; Gemini uses inline HTML event hooks; Sonnet builds HTML strings then attaches listeners.
- **Storage & validation:** Codex validates and guards storage availability; Opus wraps quota errors; Gemini/Sonnet are minimal with fewer guards.
- **Offline strategy:** Codex implements network-first navigation + offline page; Opus and Gemini are cache-first without fallback; Sonnet is cache-first but path-aware for subfolder deployment.
- **UX polish:** Codex and Sonnet emphasize status/feedback and animations; Opus adds toasts and keyboard shortcuts; Gemini stays basic and uncluttered.
