# CCAR-F Study Guide — Project Update & Changelog Summary

**Live Application URL:** [https://ccar-f-study-guide.vercel.app](https://ccar-f-study-guide.vercel.app)  
**Repository:** [kevalbuch/ccar-f-study-guide](https://github.com/kevalbuch/ccar-f-study-guide)  
**Latest Deployment Status:** `Production Ready (v1.0.0)`  

---

## 📌 Executive Summary

This document provides a comprehensive summary of all architectural fixes, single-page application (SPA) router debugging, UI/UX aesthetic enhancements, and SVG vector rendering optimizations completed up to the latest Vercel production release.

---

## 🛠️ Detailed Summary of Changes

### 1. ⚡ Single Page Application (SPA) Routing & Vercel Configuration
- **Vercel Rewrite Rule Integration (`vercel.json`)**: Replaced standard static file handling with explicit SPA rewrite rules (`"source": "/(.*)", "destination": "/index.html"`). This enables deep hash routing (e.g., `#/unit/1.1`, `#/domain/2`, `#/scenarios`) to work persistently upon refresh or direct URL navigation.
- **Hash Navigation Controller (`assets/app.js`)**: Updated click listeners on internal `#` links to force explicit re-triggering of the `route()` function even when clicking the currently active hash, resolving stuck navigation states.

### 2. 🐛 Overlay Scrim & Navigation Click-Blocking Resolution
- **Hidden Scrim Pointer Events (`assets/styles.css`)**: Resolved a critical issue where the navigation drawer backdrop (scrim) persistently intercepted mouse clicks while visually hidden. Added defensive CSS (`[hidden] { display: none !important; pointer-events: none !important; }`).
- **Modal Layer Isolation**: Updated `.palette-scrim` and `.diag-modal-backdrop` to ensure overlay layers strictly activate pointer events only when active, preventing invisible click blocks on unit subdomains and navigation links.

### 3. 🐞 JavaScript Error Stabilization & Defensiveness
- **Missing `calcReadingTime` Helper (`assets/app.js`)**: Diagnosed a silent `ReferenceError` inside `vUnit(id)` where unit page rendering crashed due to an unimported/missing `calcReadingTime` helper. Implemented the word-count algorithm to calculate dynamic reading times.
- **Automated Route Test Runner (`scratch/test_routes.js`)**: Built an automated Node.js test script to simulate and validate all **47 application routes** (30 subdomain units, 5 domain overviews, drills, exam, flashcards, glossary).
- **DOM Guard Rails**: Added null checks to `querySelector` calls in `renderQuestion`, `wireGlossary`, and interactive components, preventing runtime crashes when elements are absent.

### 4. 🎨 Sidebar Navigation & Color Hierarchy
- **Differentiated Section Headers**: Enhanced sidebar section titles with distinct HSL color tokens and glowing status indicators:
  - **`PRACTICE`**: Styled in **Vibrant Emerald Green** (`#34d399` / `#10b981`) with a glowing mint bullet.
  - **`REFERENCE`**: Styled in **Vibrant Cyan / Sky Blue** (`#38bdf8` / `#0284c7`) with a glowing blue bullet.
  - **`DATA & BACKUP`**: Styled in **Vibrant Violet / Purple** (`#c084fc` / `#7c3aed`) with a glowing purple bullet.
- **Dark/Light Theme Compatibility**: Added theme-aware CSS variables ensuring high contrast in both dark obsidian and light themes.

### 5. 📐 Diagram Inspection Lightbox & SVG Vector Typography
- **Eliminated SVG Text Stroke Artifacts**: Fixed a global SVG rule where `<svg>` elements applied a 1.8px border outline stroke to all children, making SVG text bloated and illegible when scaled. Added `stroke: none !important; stroke-width: 0 !important;` to all SVG `<text>` elements.
- **Crisp Sub-Pixel Vector Typography**: Added `-webkit-font-smoothing: antialiased` and `text-rendering: optimizeLegibility` to render diagram text razor-sharp across all screen densities.
- **Glassmorphic Lightbox Container**: Redesigned `.diagram-modal-box` with a spacious glassmorphic obsidian card, radial accent background dots, pop-in animation, and an **"ARCHITECTURE DIAGRAM"** badge header.
- **Modal Palette Color Parity**: Updated diagram component selectors (`.boxA`, `.boxOk`, `.boxBad`, `.arrow`, `.arrowhead`, `.stroke`, `.dim`, `.mono`) to target both inline figures and `.diagram-modal-body svg`. Maximized diagrams now preserve 100% exact color palette parity (terracotta orange, emerald green, crimson red, slate blue).

---

## 📜 Git Commit History

| Commit Hash | Description |
| :--- | :--- |
| `bf675a2` | Initial commit: CCAR-F Claude Certified Architect Study Guide |
| `87341da` | Fix SPA rewrites in `vercel.json` and handle same-hash routing in `app.js` |
| `980f3a4` | Fix scrim hidden display overlay bug and add modal backdrop styles |
| `0a085fc` | Fix `calcReadingTime` ReferenceError in `vUnit` and add null checks across `app.js` |
| `29bc30a` | Add distinct colors and glowing indicators for Practice, Reference, and Data & Backup sidebar section titles |
| `0d70cf1` | Redesign diagram lightbox modal with glassmorphic frame, razor-sharp vector text rendering and badge header |
| `59c4089` | Completely eliminate SVG text stroke outline for crisp razor-sharp vector typography in diagrams |
| `e2afbc5` | Ensure diagram modal SVGs inherit exact palette colors for `boxA`, `boxOk`, `boxBad`, arrows and text |

---

## 🚀 Verification & Production Status

- **Automated Route Test Coverage**: 47/47 routes verified (0 errors).
- **Vercel Production Deployment**: Successfully deployed and aliased to `https://ccar-f-study-guide.vercel.app`.
- **Git State**: Clean tree, synchronized with `origin/main`.
