# OBJEKT — landing page

Editorial, motion-driven landing page for the Codenzic Innovations ecommerce
project. Phase 1: visual foundation only — no product API, cart, or checkout.

## Concept

**OBJEKT** is framed as *a catalogue of considered objects*, not a shop.
The page reads like a magazine issue: manifesto, a horizontal index of
objects, a pinned "anatomy" study of one object, field notes, and a closing
colophon. The background morphs between a warm paper world and an ink world
as you scroll.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (CSS-variable theme tokens)
- GSAP + ScrollTrigger + Lenis smooth scroll
- Lucide icons
- Product photography in `public/products/`

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # typecheck + production build
```

## Motion system

- `src/components/SmoothScroll.tsx` — Lenis wired to GSAP's ticker; skipped
  on coarse pointers and reduced motion.
- `src/App.tsx` — global scroll systems: theme morph (`[data-theme]`) and
  shared parallax (`[data-speed]`).
- Section-level choreography lives inside each file in `src/sections/`.
- Pinned interactions (horizontal index, anatomy study) degrade to plain
  vertical layouts on mobile and for reduced-motion users.

## Structure

```
src/
  components/   shared primitives (cursor, marquee, magnetic button…)
  sections/     Hero, Manifesto, Collection, ObjectStudy, Lookbook, Footer
  lib/          data, motion constants, cn()
  styles/       Tailwind v4 theme + global css
```

`_refs/` contains cloned reference repositories (not part of the app).
