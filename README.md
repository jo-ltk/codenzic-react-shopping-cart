# OBJEKT — Shopping Cart Application

A premium curated ecommerce experience built for the **React JS Developer / Intern** technical assessment (Codenzic Innovations).

OBJEKT presents a magazine-style brand landing page paired with a live product catalogue, persistent shopping cart, and multi-step checkout — all implemented in React 19 and TypeScript.

**Repository:** https://github.com/jo-ltk/codenzic-react-shopping-cart  
**Live demo:** https://codenzic-react-shopping-cart.vercel.app

---

## Table of Contents

- [Pages & Routes](#pages--routes)
- [Technologies Used](#technologies-used)
- [Architecture](#architecture)
- [User Flow](#user-flow)
- [Features Completed](#features-completed)
- [Cart Calculation Rules](#cart-calculation-rules)
- [API](#api)
- [Project Structure](#project-structure)
- [Setup & Commands](#setup--commands)
- [Deployment](#deployment)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)

---

## Pages & Routes

The app defines **4 primary pages**, **1 catch-all 404 page**, and **2 legacy redirects** in `src/App.tsx`.

Cart, checkout, and order success are **not separate routes**. They run as steps inside the global cart drawer (`CartDrawer`), available from any page via the navigation bag control.

| Route | Page | Purpose |
|-------|------|---------|
| `/` | **Home** | Main OBJEKT experience — Hero, Manifesto, Collection, Object Study, Lookbook, catalogue preview, and Footer |
| `/about` | **About** | Brand story, beliefs, and working principles |
| `/catalogue` | **Catalogue** | Full product archive with search, filters, sort, grid/list view, and pagination |
| `/catalogue/:productId` | **Product Details** | Individual product study — gallery, specs, reviews, quantity selector, Add to Cart, related items |
| `*` | **Not Found** | In-app 404 for unknown client routes (works with Vercel SPA rewrites) |

### Redirects

| Route | Behaviour |
|-------|-----------|
| `/objects` | Redirects to `/catalogue` |
| `/objects/:productId` | Redirects to `/catalogue/:productId` |

### Home sections (anchors, not separate routes)

| Anchor | Section |
|--------|---------|
| `/#top` | Hero |
| `/#manifesto` | Manifesto (brand statement) |
| `/#collection` | Collection |
| `/#anatomy` | Object Study |
| `/#lookbook` | Lookbook |
| `/#products` | Home catalogue preview (first 8 products) |

### Cart & checkout (drawer UI)

Opened from the nav on any page:

1. **Cart Review** — line items, quantity controls, tax/discount totals  
2. **Shipping** — validated shipping form  
3. **Payment Summary** — read-only order review (no real card charge)  
4. **Order Success** — confirmation with local order reference; cart cleared  

---

## Technologies Used

| Technology | Why it is used |
|------------|----------------|
| **React 19** | Component UI, routing (`react-router`), and interactive shopping flows |
| **TypeScript** | Static typing for products, cart lines, forms, and API schemas |
| **Vite** | Fast local development and production builds |
| **Tailwind CSS** | Utility-first styling with shared CSS-variable theme tokens (paper/ink) |
| **Zustand** | Lightweight client store for cart items and drawer open state |
| **TanStack Query** | Server-state fetching, caching, retries, and loading/error status for DummyJSON |
| **Zod** | Runtime validation of API product payloads and the shipping form |
| **GSAP / ScrollTrigger** | Motion for hero, sections, nav, cart drawer, product gallery/details, and scroll-driven theme morphing |
| **localStorage** | Persist cart lines across reloads (`objekt-cart` via Zustand `persist`) |
| **pnpm** | Package management and scripts |

Also used: **Lenis** (smooth scroll, synced with ScrollTrigger) and **lucide-react** (icons).

---

## Architecture

### Product data flow

```
DummyJSON API
    → fetchProducts / fetchProductById / fetchCategories  (src/lib/api/products.ts)
    → Zod schema parse (skip invalid catalogue rows)
    → TanStack Query cache (query keys shared across Home + Catalogue + Product)
    → UI components (grids, filters, details)
```

### TanStack Query (server state)

- `QueryClientProvider` wraps the app in `main.tsx`
- Default options: 5-minute `staleTime`, one retry, no refetch on window focus
- Catalogue and home share `productsQueryKey`; categories use a longer stale time
- Product details use `productQueryKey(id)` and can fall back to the cached catalogue list

Product lists are **not** stored in Zustand.

### Zustand (cart state)

`useCartStore` owns only bag concerns:

- Persisted: `items` (id, title, price, thumbnail, category, quantity)
- Ephemeral: `isOpen`, `hasHydrated`
- Actions: `addItem`, `removeItem`, `increaseQuantity`, `decreaseQuantity`, `clear`, `openCart` / `closeCart` / `toggleCart`

Totals are derived via `calculateCartTotals` (also exposed through `useCartTotals`).

### Zod (validation)

- **API:** Product, review, dimensions, list envelope, and category-list schemas  
- **Shipping:** `fullName`, `email`, `phone`, `address`, `city`, `postalCode` with field-level and form-level checks  

### localStorage persistence

- Zustand `persist` middleware writes `{ items }` under key `objekt-cart`
- On rehydrate, `normalizePersistedCart` clamps quantity to 1–5, drops invalid lines, and dedupes by product id
- Corrupt storage fails soft (empty cart); unavailable localStorage falls back to in-memory storage

### Components & hooks

| Layer | Role |
|-------|------|
| `pages/` | Route-level screens |
| `sections/` | Home editorial blocks + home catalogue preview |
| `components/products` | Cards, grid, filters, details, gallery, skeletons, empty/error |
| `components/catalogue` | Archive filters, toolbar, pagination |
| `components/cart` | Drawer, line items, summary |
| `components/checkout` | Stepper, shipping form, payment summary, success |
| `hooks/` | `useProductFilters`, `useProductPagination`, `useCartTotals`, `useCheckoutFlow` |
| `lib/` | API, cart math, Zod schemas, Zustand store, motion helpers |

Checkout step state (shipping fields, order reference, success totals) lives in React state via `useCheckoutFlow`, so it is not persisted with the cart.

---

## User Flow

```
Home
  → Catalogue (/catalogue)
    → Product Details (/catalogue/:id)
      → Add to Cart
        → Cart drawer (Review)
          → Shipping
            → Payment Summary
              → Order Success
```

From Home, users can also open the bag or jump to `/#products` for a preview, then continue into the full catalogue.

---

## Features Completed

- Live product catalogue from DummyJSON (≥10 products; full catalogue with `limit=0`)
- Product cards: image, title, category, price, rating, Add to Cart
- Search by title (case-insensitive, partial)
- Category filtering from API `category-list`
- Min/max price filtering
- Material (tags) and availability filters
- Sort: Featured, Price, Title, Rating
- Client-side pagination (8 per page on `/catalogue`)
- Grid / list catalogue views
- Product details page with gallery, specs, reviews, qty 1–5, related products
- Cart: add / remove / increase / decrease / clear; duplicate adds merge
- Quantity limits 1–5 with disabled controls at bounds
- Tax, discount, and minimum-checkout rules
- Cart persistence in localStorage
- Checkout: Review → Shipping → Payment → Success
- Shipping Zod validation with inline field errors
- Payment summary (simulated; no card charged)
- Order success with local reference (`OBJ-…`); cart cleared on place order
- Loading skeletons, API error + retry, empty catalogue / empty filter / empty cart states
- Responsive layouts (`sm` / `md` / `lg`)
- Editorial home experience and About page
- In-app 404 page
- GSAP motion (including reduced-motion awareness where applied)

---

## Cart Calculation Rules

Implemented in `src/lib/cart/calculations.ts` using integer cents to avoid float drift.

| Rule | Value |
|------|--------|
| Quantity | **1–5** per line |
| Tax | **5%** of subtotal |
| Discount | **10%** of subtotal when subtotal **> $100** (strictly greater than 100) |
| Final total | subtotal + tax − discount |
| Minimum checkout | final total **≥ $10** |

```
subtotal    = Σ (price × quantity)
tax         = round(subtotal × 0.05)
discount    = subtotal > 100 ? round(subtotal × 0.10) : 0
finalTotal  = subtotal + tax − discount
canCheckout = finalTotal >= 10
```

Display amounts are formatted with `formatMoney` (EUR locale formatting). Thresholds use the numeric major units above.

Verify with:

```bash
pnpm verify:cart
```

---

## API

**Provider:** [DummyJSON](https://dummyjson.com)  
**Base URL:** `https://dummyjson.com`

| Endpoint | Purpose |
|----------|---------|
| `GET /products?limit=0` | Full product catalogue |
| `GET /products/:id` | Single product |
| `GET /products/category-list` | Category filter options |

Responses are validated with Zod before use. Malformed catalogue rows are skipped; if none remain valid, the query errors.

---

## Project Structure

```
src/
  App.tsx                 # Routes + global shell (nav, cart drawer, cursor, grain)
  main.tsx                # React root + QueryClientProvider
  pages/                  # Home, About, Catalogue, Product, NotFound
  sections/               # Landing sections (Hero, Manifesto, Collection, …)
  components/
    products/             # Catalogue/product UI
    catalogue/            # Archive toolbar, filters, pagination
    cart/                 # Drawer + line items + summary
    checkout/             # Checkout steps
  hooks/                  # Filters, pagination, totals, checkout flow
  lib/
    api/                  # DummyJSON + Zod
    cart/                 # Money math + verify script
    checkout/             # Shipping schema
    store/                # Zustand cart + persistence helpers
    motion.ts             # GSAP / ScrollTrigger setup
  styles/                 # Global theme CSS
```

---

## Setup & Commands

### Prerequisites

- Node.js 20+
- pnpm

### Install & run

```bash
pnpm install
pnpm dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite development server |
| `pnpm build` | Typecheck (`tsc -b`) + production build |
| `pnpm preview` | Preview the production build |
| `pnpm verify:cart` | Run cart calculation checks |

`npm` works as well if preferred (`npm install` / `npm run …`); the repository currently includes `package-lock.json`.

---

## Deployment

- **Host:** [Vercel](https://vercel.com)
- **Live URL:** https://codenzic-react-shopping-cart.vercel.app
- **SPA routing:** `vercel.json` rewrites all paths to `/index.html` so client routes (`/catalogue/:id`, 404, etc.) resolve correctly

---

## Known Limitations

- Checkout payment is simulated — no payment gateway or card processing
- Orders are confirmed only in client state (order reference is generated locally; no backend order API)
- Product inventory comes from DummyJSON and may not match the editorial furniture brand aesthetic on the landing page
- Search, filters, sort, and pagination run entirely on the client after the full catalogue is fetched
- Cart persistence is browser-local only (no cross-device sync or authenticated carts)

---

## Future Improvements

- Persist placed orders to a backend and email/order-history UI
- Real payment provider integration
- Server-side filtering / pagination for larger catalogues
- Authenticated user sessions and saved addresses
- Wishlist / favourites
- Stronger alignment between DummyJSON inventory and brand imagery (or a curated product API)

---

## License

Private assignment project — Codenzic Innovations React JS Developer / Intern assessment.
