# FocusFlow Lists

A modern, installable multi-list to-do Progressive Web App built with vanilla HTML, CSS, and JavaScript.

## ✨ Key features

- Manage unlimited lists: create, rename, delete, and switch with a single tap
- Inline task editing, quick completion toggles, and destructive action confirmations
- Automatic persistence via `localStorage` with graceful quota error messaging
- Fully responsive layout with keyboard- and touch-friendly interactions
- Offline support powered by a versioned service worker, Cache Storage, and an offline fallback page
- Install-ready manifest with maskable icons (192px & 512px) and tuned theme colors

## 🚀 Run it locally

1. Serve the project root over HTTPS-friendly static hosting (any server works). For quick testing:
   ```bash
   npx serve .
   ```
2. Visit the printed URL (e.g., `http://localhost:3000`) in a modern browser.
3. Open DevTools → Application to inspect the service worker, manifest, `localStorage`, and caches.

> Tip: Service workers require HTTPS in production. When deploying, host the contents of this folder on a secure origin.

## 🗂️ Project structure

```
├── index.html          # App shell + UI scaffolding
├── offline.html        # Friendly offline fallback page
├── manifest.json       # PWA metadata & icons
├── sw.js               # Cache-first + network-first service worker
├── css/
│   └── styles.css      # Responsive, mobile-first design system
└── js/
    ├── app.js          # UI logic, list/task management, offline UX
    ├── db.js           # Persistence helpers around localStorage
    └── utils.js        # Shared helpers (IDs, sanitization, formatting)
```

## 🧪 Testing checklist

- Add/rename/delete lists and confirm counts update everywhere
- Add tasks, toggle completion, inline-edit text, and delete tasks
- Reload the page to verify data persists
- Toggle browser offline mode → tasks remain accessible and navigation falls back to `offline.html`
- Run a Lighthouse PWA audit to confirm installability

## 📦 Deployment

Upload the static files to any HTTPS host or CDN. Because everything is client-side, no build step is required. Update `CACHE_VERSION` in `sw.js` whenever you ship new assets to ensure users receive the latest bundle.
