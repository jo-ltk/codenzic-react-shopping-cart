# Shopping Cart Application — Audit Report

Audit of the existing OBJEKT shopping cart application against the assignment requirements. Findings below reflect the state **before fixes**, with remediation noted.

## PASS (already correct before fixes)

- React 19 + TypeScript + Vite project structure
- Responsive editorial UI (paper/ink theme, typography, spacing)
- TanStack Query wired in `main.tsx` with staleTime / retry
- Zustand cart store with add / remove / increase / decrease / clear
- Quantity limits 1–5 with disabled +/- buttons
- Duplicate add merges into existing line (no broken duplicates)
- Cart calculations centralized in `src/lib/cart/calculations.ts` (cent-safe)
  - Tax = 5% of subtotal
  - Discount = 10% when subtotal **>** $100
  - Final = subtotal + tax − discount
- Checkout disabled when final total &lt; $10 with explanatory message
- Checkout steps: Cart Review → Shipping → Payment Summary → Success
- Shipping form uses React state + Zod (not RHF/Formik)
- Field-level validation errors next to inputs
- Payment summary is read-only; Place Order clears cart and shows success
- Zustand `persist` middleware + localStorage with corrupt-data guards
- Search by title (case-insensitive, partial)
- Category + min/max price filters + Clear all
- Custom hook `useProductFilters` for filter logic
- Loading skeletons, API error UI, empty catalogue, empty filter results
- Product cards show image, title, category, price, rating, Add to Cart
- Cart item count in nav; cart drawer with line totals and summary

## FAIL (before fixes)

### 1. Product API used local mock data — not DummyJSON
- **File:** `src/lib/api/products.ts` (formerly imported `objekt-products.ts`)
- **Problem:** `fetchProducts()` returned curated local `OBJEKT_PRODUCTS` instead of calling `https://dummyjson.com/products`
- **Why:** Assignment requires a public product API (DummyJSON)
- **Fix:** Fetch + Zod-validate DummyJSON (`?limit=0` → 194 products)

### 2. Hardcoded / curated category allow-list
- **File:** `src/lib/api/products.ts` (`RELEVANT_CATEGORIES`)
- **Problem:** Categories filtered to a fixed furniture/lighting set; not from API
- **Why:** Assignment requires categories from the API, not hardcoded options
- **Fix:** `fetchCategories()` → `https://dummyjson.com/products/category-list`; filter UI uses API list

### 3. Fewer than 10 products
- **File:** `src/lib/data/objekt-products.ts`
- **Problem:** Only 7 curated products
- **Why:** Assignment requires at least 10
- **Fix:** Full DummyJSON catalogue (≥10)

### 4. Missing Product Details view
- **Files:** catalogue / cards had no details route/modal
- **Problem:** Bonus feature requested for full DummyJSON fields + image gallery
- **Fix:** `ProductDetails` slide-over with gallery, qty selector, reviews, etc.

## MISSING (before fixes)

| Requirement | Status after fix |
|-------------|------------------|
| DummyJSON product API | Implemented |
| Categories from API | Implemented |
| Product details view (bonus) | Implemented |
| Basic cart calculation tests (bonus) | `npm run verify:cart` |
| Product sorting (bonus) | Not added (optional; avoided scope creep) |
| Dark mode (bonus) | Not added (existing theme morph covers dual worlds) |

## EDGE CASES

| Case | Result |
|------|--------|
| API unavailable | Error state + retry (TanStack Query) |
| Empty products array | Empty catalogue state |
| Invalid product rows | Skipped; throws only if none valid |
| One / many images | Gallery + selected thumbnail styling |
| Missing optional fields | Safe fallbacks (`—` / omitted) |
| Long titles / descriptions | `break-words` on cards + details |
| Search no results | Filter empty state + clear |
| Qty 0 / 6 attempts | Clamped; buttons disabled at 1 and 5 |
| Subtotal = 100 | No discount (strictly greater than 100) |
| Subtotal &gt; 100 | 10% discount applied |
| Corrupt localStorage | Normalized / empty cart, no crash |
| Place order | Success UI, cart cleared, checkout reset on close |

## RESPONSIVE ISSUES

- Pre-existing catalogue / cart / checkout layouts are already mobile-aware (`sm`/`md`/`lg` breakpoints)
- Product details panel: full-width on mobile, max-width drawer on tablet/desktop; gallery wraps
- No redesign performed; only details overlay added in existing visual language
- Residual note: landing hero/editorial sections remain luxury-furniture themed while the shop catalogue now shows DummyJSON stock (intentional for API compliance)

## CALCULATION VERIFICATION

**Formulas (unchanged, correct):**

```
subtotal   = Σ (price × quantity)          // via integer cents
tax        = round(subtotal × 0.05)
discount   = subtotal > 100 ? round(subtotal × 0.10) : 0
finalTotal = subtotal + tax − discount
canCheckout = finalTotal >= 10
quantity   ∈ [1, 5]
```

Verified with `npm run verify:cart` (empty, under $10, at $10+, exactly $100, above $100, multi-item).

## API VERIFICATION

| Check | Status |
|-------|--------|
| DummyJSON `https://dummyjson.com/products` | Yes |
| DummyJSON category-list | Yes |
| TanStack Query for products (+ categories) | Yes |
| Zod validation of API products | Yes |
| Zod shipping validation | Yes |
| Product data not stored in Zustand | Yes (only cart lines) |

## FINAL ASSIGNMENT CHECKLIST

| Requirement | Status |
|-------------|--------|
| React | PASS |
| TypeScript | PASS |
| Responsive UI | PASS |
| Public product API (DummyJSON) | PASS |
| TanStack Query | PASS |
| Zustand | PASS |
| Zod (API + shipping) | PASS |
| localStorage persistence | PASS |
| Product listing (≥10) | PASS |
| Image / title / category / price / rating | PASS |
| Add to Cart | PASS |
| Loading / error / empty states | PASS |
| Search by title | PASS |
| Category filtering (API categories) | PASS |
| Price filtering | PASS |
| Clear filters | PASS |
| Cart add/remove/qty/clear/count | PASS |
| Quantity 1–5 | PASS |
| Tax 5% | PASS |
| Discount 10% above $100 subtotal | PASS |
| $10 minimum checkout | PASS |
| Cart Review / Shipping / Payment | PASS |
| Shipping Zod validation | PASS |
| Place order clears cart | PASS |
| Product details (bonus) | PASS |
| Cart calc tests (bonus) | PASS |
| Product sorting (bonus) | MISSING (optional) |
| Dark mode toggle (bonus) | MISSING (optional; theme morph exists) |

## Changes made in this audit pass

1. Replaced mock catalogue with DummyJSON fetch + Zod parsing
2. Added API category list for filters
3. Removed unused curated product mock module
4. Added Product Details overlay (gallery, qty, reviews, metadata)
5. Extended `addItem` for multi-qty + optional silent add from details
6. Added `npm run verify:cart` calculation checks
