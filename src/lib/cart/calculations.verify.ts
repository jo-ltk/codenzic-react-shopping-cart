/**
 * Basic verification for cart calculation rules (assignment bonus).
 * Run: npx --yes tsx src/lib/cart/calculations.verify.ts
 */
import {
  CART_DISCOUNT_THRESHOLD,
  CART_MIN_CHECKOUT,
  calcLineTotal,
  calculateCartTotals,
  clampQuantity,
  formatMoney,
} from "./calculations.ts";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function nearlyEqual(a: number, b: number) {
  return Math.abs(a - b) < 0.001;
}

// Quantity clamps
assert(clampQuantity(0) === 1, "qty 0 → 1");
assert(clampQuantity(6) === 5, "qty 6 → 5");
assert(clampQuantity(3.9) === 3, "qty truncates");

// Line total
assert(nearlyEqual(calcLineTotal(9.99, 2), 19.98), "line total 9.99×2");

// Empty cart
{
  const t = calculateCartTotals([]);
  assert(t.subtotal === 0 && t.tax === 0 && t.discount === 0 && t.finalTotal === 0, "empty");
  assert(t.canCheckout === false, "empty cannot checkout");
}

// Under $10 final total
{
  const t = calculateCartTotals([{ price: 5, quantity: 1 }]);
  assert(nearlyEqual(t.subtotal, 5), "subtotal 5");
  assert(nearlyEqual(t.tax, 0.25), "tax 5%");
  assert(t.discount === 0, "no discount under 100");
  assert(nearlyEqual(t.finalTotal, 5.25), "final 5.25");
  assert(t.canCheckout === false, "below min checkout");
}

// Exactly $10 final-ish: 9.53 * 1.05 ≈ 10.0065 → can checkout
{
  const t = calculateCartTotals([{ price: 10, quantity: 1 }]);
  assert(nearlyEqual(t.finalTotal, 10.5), "10 + 5% tax");
  assert(t.canCheckout === true, "at/above min checkout");
  assert(t.finalTotal >= CART_MIN_CHECKOUT, "meets min");
}

// Subtotal exactly 100 — no discount (must be greater than 100)
{
  const t = calculateCartTotals([{ price: 20, quantity: 5 }]);
  assert(nearlyEqual(t.subtotal, 100), "subtotal 100");
  assert(t.subtotal <= CART_DISCOUNT_THRESHOLD, "at threshold");
  assert(t.discount === 0, "no discount at exactly 100");
  assert(nearlyEqual(t.tax, 5), "tax at 100");
  assert(nearlyEqual(t.finalTotal, 105), "final at 100 subtotal");
}

// Subtotal above 100 — 10% discount
{
  const t = calculateCartTotals([{ price: 50, quantity: 3 }]);
  assert(nearlyEqual(t.subtotal, 150), "subtotal 150");
  assert(nearlyEqual(t.tax, 7.5), "tax 7.5");
  assert(nearlyEqual(t.discount, 15), "discount 10%");
  assert(nearlyEqual(t.finalTotal, 142.5), "final 150+7.5-15");
  assert(t.canCheckout === true, "can checkout");
}

// Multi-item + qty 5
{
  const t = calculateCartTotals([
    { price: 12.5, quantity: 5 },
    { price: 8, quantity: 2 },
  ]);
  assert(nearlyEqual(t.subtotal, 78.5), "multi subtotal");
  assert(t.itemCount === 7, "item count");
  assert(t.discount === 0, "no discount");
}

assert(formatMoney(12.5).includes("12.50"), "money format");

console.log("Cart calculation verification: PASS");
