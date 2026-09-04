/**
 * Single source of truth for OBJEKT cart money math.
 * All currency work uses integer cents to avoid float drift.
 */

export const CART_MIN_QTY = 1;
export const CART_MAX_QTY = 5;
export const CART_TAX_RATE = 0.05;
export const CART_DISCOUNT_RATE = 0.1;
export const CART_DISCOUNT_THRESHOLD = 100;
export const CART_MIN_CHECKOUT = 10;

export type CartCalcItem = {
  price: number;
  quantity: number;
};

export type CartTotals = {
  subtotal: number;
  tax: number;
  discount: number;
  /** Alias used by UI — same as finalTotal. */
  total: number;
  finalTotal: number;
  canCheckout: boolean;
  itemCount: number;
};

/** Coerce a number into a safe non-negative finite value. */
export function safeNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || Number.isNaN(n)) return fallback;
  return n;
}

/** Round to nearest cent (half-up via Math.round). */
export function toCents(amount: number): number {
  return Math.round(safeNumber(amount) * 100);
}

/** Convert cents back to a displayable major-unit amount. */
export function fromCents(cents: number): number {
  return safeNumber(cents) / 100;
}

/** Clamp quantity into the allowed 1–5 range. */
export function clampQuantity(quantity: unknown): number {
  const q = Math.trunc(safeNumber(quantity, CART_MIN_QTY));
  return Math.min(CART_MAX_QTY, Math.max(CART_MIN_QTY, q));
}

/** Line total for one cart item (price × quantity), in major units. */
export function calcLineTotal(price: number, quantity: number): number {
  const unitCents = toCents(safeNumber(price));
  const qty = clampQuantity(quantity);
  return fromCents(unitCents * qty);
}

/**
 * Derive subtotal, tax, discount, and final total from cart items.
 *
 * Rules:
 * - subtotal = Σ (price × quantity)
 * - tax = 5% of subtotal
 * - discount = 10% of subtotal when subtotal > 100, else 0
 * - finalTotal = subtotal + tax − discount
 * - checkout enabled only when finalTotal >= 10
 */
export function calculateCartTotals(items: CartCalcItem[]): CartTotals {
  const list = Array.isArray(items) ? items : [];

  let subtotalCents = 0;
  let itemCount = 0;

  for (const item of list) {
    const qty = clampQuantity(item?.quantity);
    const unitCents = toCents(item?.price);
    subtotalCents += unitCents * qty;
    itemCount += qty;
  }

  if (subtotalCents < 0 || !Number.isFinite(subtotalCents)) {
    subtotalCents = 0;
  }

  const taxCents = Math.round(subtotalCents * CART_TAX_RATE);
  const discountCents =
    fromCents(subtotalCents) > CART_DISCOUNT_THRESHOLD
      ? Math.round(subtotalCents * CART_DISCOUNT_RATE)
      : 0;

  let finalCents = subtotalCents + taxCents - discountCents;
  if (!Number.isFinite(finalCents) || finalCents < 0) {
    finalCents = 0;
  }

  const subtotal = fromCents(subtotalCents);
  const tax = fromCents(taxCents);
  const discount = fromCents(discountCents);
  const finalTotal = fromCents(finalCents);

  return {
    subtotal,
    tax,
    discount,
    total: finalTotal,
    finalTotal,
    canCheckout: finalTotal >= CART_MIN_CHECKOUT,
    itemCount,
  };
}

/** Format money consistently to exactly 2 decimal places. Never returns NaN. */
export function formatMoney(value: unknown): string {
  const amount = Math.max(0, safeNumber(value));
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
