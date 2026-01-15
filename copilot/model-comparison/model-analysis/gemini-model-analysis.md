# AI Model Coding Style Analysis: To-Do PWA

This document analyzes the coding styles, architectural decisions, and approaches taken by four different AI models (Gemini 3 Pro, GPT 5.1 Codex, Opus 4.5, and Sonnet 4.5) in generating a To-Do List Progressive Web App (PWA).

## Executive Summary

*   **Gemini 3 Pro**: Produces a **simple, functional prototype**. It uses older patterns (inline HTML handlers) and a monolithic structure, making it easy to understand for beginners but less scalable.
*   **GPT 5.1 Codex**: Demonstrates **modern, professional engineering**. It uses ES Modules, strict separation of concerns, event delegation, and robust feedback mechanisms. It prioritizes the specific prompt instructions over general agent best practices where they conflict.
*   **Opus 4.5**: Focuses on **robustness and accessibility**. It features a structured "Database" abstraction (wrapping localStorage), comprehensive ARIA attributes, and detailed error handling. It strikes a balance between modularity and simplicity.
*   **Sonnet 4.5**: Emphasizes **tooling and asset completeness**. While the application logic is monolithic, it goes the extra mile in generating helper scripts for PWA assets (icons) and detailed manifest configurations, ensuring a high-quality "install" experience.

---

## 1. Project Structure & Architecture

| Feature | Gemini 3 Pro | GPT 5.1 Codex | Opus 4.5 | Sonnet 4.5 |
| :--- | :--- | :--- | :--- | :--- |
| **JS Organization** | Monolithic (`app.js`) | **Modular (ES Modules)** (`app.js`, `db.js`, `utils.js`) | Modular (Script Tags) (`app.js`, `db.js`) | Monolithic (`app.js`) |
| **Entry Point** | Inline script in HTML | `<script type="module">` | `document.addEventListener` | `document.addEventListener` |
| **State Mgmt** | Simple Global Object | Store Object + "Snapshot" pattern | Wrapper Object (`TodoDB`) | Global Variables |
| **DOM Pattern** | Manual Creation + Inline Events | `template` tag + Cloning + **Event Delegation** | `innerHTML` + Manual Listeners | `innerHTML` + Select & Attach |

### Key Observations
*   **Gemini** uses the oldest pattern of exposing functions to the global `window` object to allow `onclick="deleteTask(...)"` in HTML. This is generally discouraged in modern development.
*   **Codex** is the only one to use native **ES Modules** (`import`/`export`), representing the most modern standard for JavaScript development. It also correctly leverages the `<template>` element for efficient DOM rendering.
*   **Opus** creates a pseudo-namespace `TodoDB` to encapsulate data logic, keeping `app.js` focused on UI.
*   **Sonnet** includes unique helper files (`generate-pwa-icons.js`, `icon-converter.html`) to help the user generate the necessary PWA assets, a thoughtful addition not explicitly requested but highly valuable.

## 2. Data Persistence (Storage)

The prompt asked for `localStorage`, while the `pwa-expert-agent.md` recommended `IndexedDB`.

*   **Gemini**: Used `localStorage`. Simple JSON serialization.
*   **Codex**: Used `localStorage`. Implemented a "Storage Available" check and a robust feedback system (toast messages) when saving occurs.
*   **Opus**: Used `localStorage`. Wrapped in a `TodoDB` object that mimics a database interface (e.g., `TodoDB.getLists()`). Explicitly handles `QuotaExceededError`.
*   **Sonnet**: Used `localStorage`. Splits data into separate keys (`_lists`, `_tasks`) rather than one large JSON object.

**Analysis**: All models followed the specific prompt instruction (`localStorage`) over the agent's general recommendation (`IndexedDB`), which is the correct behavior (user prompt > general knowledge). **Codex** and **Opus** provided the most robust wrappers around the raw API.

## 3. PWA & Service Worker Implementation

*   **Gemini**:
    *   **Strategy**: Basic Cache-First.
    *   **Uniqueness**: Uses a single SVG icon for the manifest, which is a clever way to support all sizes without generating multiple files (if supported by the OS).
*   **Codex**:
    *   **Strategy**: **Network-First** for navigation (HTML), **Cache-First** for assets.
    *   **Robustness**: Explicitly handles an `offline.html` fallback. Checks for absolute URLs during precache.
*   **Opus**:
    *   **Strategy**: Cache-First. Uses a standard `static` asset list.
    *   **Manifest**: Very detailed, including `shortcuts` and specific `purpose: "maskable any"` for icons.
*   **Sonnet**:
    *   **Strategy**: Cache-First.
    *   **robustness**: Includes logic to handle relative paths/sub-directories (`BASE_URL` calculation), which is often a pain point in PWA deployment.

## 4. HTML & Accessibility (a11y)

*   **Gemini**: HTML is semantic but basic.
*   **Codex**: **High Accessibility**. Uses `aria-live`, `role="status"`, `aria-haspopup`. Includes a `<noscript>` fall back.
*   **Opus**: **High Accessibility**. Uses `role="listbox"`, `aria-selected`, `aria-label`.
*   **Sonnet**: Standard accessibility. Uses `aria-label` and `role="menu"`.

## 5. UI/UX Features

*   **Gemini**: Basic "My Tasks" view. Simple sidebar.
*   **Codex**: Includes a "Status Pill" for network state, a "Management" dialog, and a comprehensive "Feedback/Toast" system. Handles empty states gracefully.
*   **Opus**: Includes specific "Toast" notifications, a dedicated "Offline" indicator, and confirmation dialogs for destructive actions.
*   **Sonnet**: Includes a dropdown for list selection (vs sidebar in others), and a dedicated "Icon Generator" UI.

## Conclusion

*   **Best for Modern Engineering**: **GPT 5.1 Codex**. The use of ES Modules, Event Delegation, HTML Templates, and Network-First caching demonstrates a high level of front-end maturity.
*   **Best for Robustness/Stability**: **Opus 4.5**. The `TodoDB` abstraction and careful error handling make it likely to be the most reliable in production.
*   **Best for "Completeness"**: **Sonnet 4.5**. If you need to deploy a real app, the inclusion of icon generation tools and manifest shortcuts saves significant time.
*   **Best for Beginners**: **Gemini 3 Pro**. The code is straightforward, short, and easy to read, though it uses older patterns.
