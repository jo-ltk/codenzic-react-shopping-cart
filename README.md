# OBJEKT — landing page + shopping cart

Editorial, motion-driven ecommerce experience for the Codenzic Innovations
assignment. Landing sections remain magazine-style; the catalogue/cart/checkout
fulfill the shopping-cart requirements.

## Concept

**OBJEKT** is framed as *a catalogue of considered objects*. The page reads like
a magazine issue, then opens into a live product catalogue powered by DummyJSON.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (CSS-variable theme tokens)
- TanStack Query (DummyJSON products + categories)
- Zustand + localStorage (cart persistence)
- Zod (API + shipping validation)
- GSAP + ScrollTrigger + Lenis smooth scroll

## Run

```bash
npm install
npm run dev          # local dev server
npm run build        # typecheck + production build
npm run verify:cart  # cart calculation checks
```

## Audit

See `AUDIT_REPORT.md` for the full assignment audit, checklist, and fixes.
