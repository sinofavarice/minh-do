# Minh Do portfolio

Photographer / creative director site. Vite + React + TypeScript + React Router.

## Run

```bash
npm run dev -- --host 127.0.0.1 --port 5173
npm run build
```

## Structure

- Single continuous experience: `src/pages/Portfolio.tsx` + `Portfolio.css` for `/` and `/work` (shared mount via `path="*"` in `App.tsx` — do not remount between them).
- Archive / info: `src/pages/Placeholder.tsx` (`/about` redirects to `/info`).
- Images: `public/work/`, `public/hero.jpg`. Data: `src/data/workImages.ts`.

## Design law

- Editorial B&W: white ground, black ink, Outfit for UI type.
- **No vertical reel.** Three control steps:
  1. **Home** — hero + signature; header `minh do` / `info`; mid-plate `work` / `archive` (golden-section of hero). Hover work → thumb strip.
  2. **Work scroller** — click work → nav floats into header → horizontal overlapping project fan (arrows/wheel). Left roman index + title, right year.
  3. **Project window** — click a fan cover (or Enter) → **image 01 full-bleed plate**; further scrolls are editorial spreads (pair layouts + credits/body). Escape → back to scroller.
- Nav float: shared 1.05s ease (`cubic-bezier(0.65, 0, 0.35, 1)`), same DOM, no remount.
- Preserve **natural aspect ratios** on fan covers (fixed height, auto width). Prefer slightly smaller sizes over oversized thumbs.
- Brand-first first viewport — not a dashboard.

## Agent habits

- Prefer editing `Portfolio.*` over resurrecting unused `Landing` / `Work` / `WorkPreview` unless explicitly asked.
- Verify UI in the browser after motion/layout changes.
- Don’t commit unless asked.
