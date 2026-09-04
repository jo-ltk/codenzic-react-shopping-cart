# OBJEKT — Shopping Cart Application

## Project Overview

**OBJEKT** is a premium curated ecommerce shopping experience framed as a catalogue of considered objects. The app pairs an editorial, magazine-style landing with a live product archive, cart drawer, and multi-step checkout.

It was built for the **React JS Developer / Intern** assignment (Codenzic Innovations).

## Technologies

- **React 19** — UI and routing (`react-router`)
- **TypeScript** — typed components, stores, and API schemas
- **Vite** — tooling and local/production builds
- **Tailwind CSS** — styling with CSS-variable theme tokens
- **Zustand** — cart state with `persist` middleware
- **TanStack Query** — product and category fetching/caching
- **Zod** — product API and shipping form validation
- **localStorage** — cart persistence (`objekt-cart`)
- **pnpm** — package manager
- **GSAP** (+ ScrollTrigger, `@gsap/react`) — page/section motion, cart drawer transitions, product gallery/details, nav, and scroll-driven theme morphing
- **Lenis** — smooth scrolling (wired to ScrollTrigger)

## Features

### Product catalogue

- Home preview of the first 8 live products (`/#products`) with a link to the full archive
- Dedicated catalogue archive at `/catalogue` with grid/list views
- Product cards show image, title, category, price, rating, and Add to Cart

### Product API integration

- Live catalogue from [DummyJSON](https://dummyjson.com)
- Categories loaded from the API category list (not hardcoded)
- Single-product fetch for the details route

### Search, filtering & sorting

- Case-insensitive title search (partial match)
- Category filtering (API category slugs)
- Min/max price filtering
- Material filter (from product tags) and availability filter (from `availabilityStatus`)
- Sort: Featured, Price low→high / high→low, Title A–Z, Rating
- Clear-all filters control

### Pagination

- Client-side pagination on `/catalogue` (8 products per page)
- Page resets when search, filters, or sort change

### Product details

- Route: `/catalogue/:productId`
- Image gallery, quantity selector (1–5), Add to Cart
- Extended DummyJSON fields (description, brand, stock, dimensions, warranty, shipping, return policy, reviews, and more)
- Related products from the same catalogue cache
- Loading, not-found, and error states

### Cart management

- Slide-over cart drawer from the nav
- Add, remove, increase, decrease, and clear
- Duplicate adds merge into the existing line
- Quantity limited to **1–5** (controls disable at the bounds)
- Line totals and live bag summary
- Cart item count in the navigation

### Cart calculations

- Centralized in `src/lib/cart/calculations.ts` (integer cents to avoid float drift)
- Subtotal, tax, discount, and final total shown in the drawer
- Checkout blocked below the minimum order value, with an explanatory message

### Tax and discount

- Tax = **5%** of subtotal
- Discount = **10%** of subtotal when subtotal **> $100** (strictly greater than 100)
- Final total = subtotal + tax − discount
- Display currency formatting uses EUR via `formatMoney`

### Cart persistence

- Cart lines persist across reloads via Zustand `persist` + localStorage
- Corrupt or invalid stored rows are normalized or dropped safely

### Checkout flow

Steps inside the cart drawer:

1. **Review** — bag lines and totals
2. **Shipping** — validated address form
3. **Payment** — read-only summary (no real card charge)
4. **Success** — confirmation with order reference and total; bag is cleared

### Shipping validation

- Full name, email, phone, address, city, postal code
- Field-level and form-level Zod validation with inline errors
- React state only (no React Hook Form / Formik)

### Payment summary & order success

- Read-only ship-to block, line items, tax/discount breakdown
- Place Order generates a local reference (`OBJ-…`), stores total for the success screen, then clears the cart
- Continue Shopping closes the drawer and resets checkout

### Responsive design

- Mobile-first layouts with `sm` / `md` / `lg` breakpoints
- Responsive nav (including mobile menu), catalogue, product study, and cart/checkout panel

### Loading / error / empty states

- Product skeletons while fetching
- API error UI with retry
- Empty catalogue and empty filter-result states
- Empty cart state in the drawer

### Editorial experience (completed)

- Home sections: Hero, Manifesto, Collection, Object Study, Lookbook, catalogue preview, Footer
- About page at `/about`
- Custom cursor, grain overlay, magnetic buttons, and scroll/theme motion where GSAP is used

## Cart Calculations

| Rule | Value |
|------|--------|
| Quantity limits | **1–5** per line |
| Tax | **5%** of subtotal |
| Discount | **10%** of subtotal when subtotal **> $100** |
| Final total | subtotal + tax − discount |
| Minimum checkout | final total **≥ $10** |

```
subtotal    = Σ (price × quantity)   // via integer cents
tax         = round(subtotal × 0.05)
discount    = subtotal > 100 ? round(subtotal × 0.10) : 0
finalTotal  = subtotal + tax − discount
canCheckout = finalTotal >= 10
```

Run calculation checks:

```bash
pnpm verify:cart
```

## API

Base URL: `https://dummyjson.com`

| Endpoint | Usage |
|----------|--------|
| `GET /products?limit=0` | Full product catalogue |
| `GET /products/:id` | Single product details |
| `GET /products/category-list` | Category filter options |

**TanStack Query** caches these requests (`QueryClientProvider` in `main.tsx`, default `staleTime` 5 minutes). Catalogue and home share the products query key; categories use a longer stale time.

**Zod** validates each product (and the response envelope). Malformed catalogue rows are skipped; if none are valid, the fetch fails. Single-product responses must pass the same schema.

## State Management

**Zustand** (`useCartStore`) owns only the shopping bag:

- `items` — persisted cart lines
- `isOpen` / open / close / toggle — drawer UI (ephemeral)
- `addItem`, `removeItem`, `increaseQuantity`, `decreaseQuantity`, `clear`
- `getTotals()` — delegates to `calculateCartTotals`

**Persistence:** Zustand `persist` writes `{ items }` to localStorage under `objekt-cart`. On rehydrate, `normalizePersistedCart` clamps quantities to 1–5, drops invalid lines, and dedupes by product id. If localStorage is unavailable, an in-memory fallback is used.

Product lists stay in **TanStack Query**. Checkout step, shipping form, and order success data live in **React state** (`useCheckoutFlow`) so they are not persisted with the cart.

## Validation

### Product data (`src/lib/api/products.ts`)

Zod schemas for products, reviews, dimensions, the products list envelope, and the category list. Required fields (id, title, category, price, images) are enforced; optional DummyJSON fields stay optional with safe defaults.

### Shipping form (`src/lib/checkout/shippingSchema.ts`)

Zod object schema for `fullName`, `email`, `phone`, `address`, `city`, and `postalCode`. `validateShipping` supports whole-form or single-field checks used on blur and submit.

## Project Structure

```
src/
  pages/           # Home, About, Catalogue archive, Product details
  sections/        # Landing editorial blocks + home catalogue preview
  components/
    products/      # Cards, grid, filters, details, gallery, skeletons, empty/error
    catalogue/     # Archive filters, toolbar, pagination
    cart/          # Drawer, line items, summary
    checkout/      # Stepper, shipping form, payment summary, success
  hooks/           # useProductFilters, useProductPagination, useCartTotals, useCheckoutFlow
  lib/
    api/           # DummyJSON fetch + Zod schemas
    cart/          # Calculation rules + verify script
    checkout/      # Shipping Zod schema
    store/         # Zustand cart + localStorage helpers
    motion.ts      # GSAP / ScrollTrigger setup
  styles/          # Global Tailwind / theme CSS
```

## Setup

```bash
pnpm install
pnpm dev
```

Other scripts:

```bash
pnpm build        # typecheck + production build
pnpm preview      # preview production build
pnpm verify:cart  # cart calculation checks
```

Open the local URL printed by Vite (typically `http://localhost:5173`).
