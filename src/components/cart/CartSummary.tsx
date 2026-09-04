import {
  CART_DISCOUNT_RATE,
  CART_DISCOUNT_THRESHOLD,
  CART_MIN_CHECKOUT,
  CART_TAX_RATE,
  type CartTotals,
} from "@/lib/store/cart";
import { cn } from "@/lib/utils";

interface CartSummaryProps {
  totals: CartTotals;
  onCheckout?: () => void;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function CartSummary({ totals, onCheckout }: CartSummaryProps) {
  const { subtotal, tax, discount, total, canCheckout } = totals;
  const discountPct = Math.round(CART_DISCOUNT_RATE * 100);
  const taxPct = Math.round(CART_TAX_RATE * 100);

  return (
    <div data-cart-summary className="border-t border-charcoal/15 pt-6">
      <dl className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <dt className="meta text-charcoal/45">Subtotal</dt>
          <dd className="meta text-charcoal" data-cart-subtotal>
            {formatMoney(subtotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="meta text-charcoal/45">Tax ({taxPct}%)</dt>
          <dd className="meta text-charcoal" data-cart-tax>
            {formatMoney(tax)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="meta text-charcoal/45">
            Discount
            {discount > 0 ? ` (${discountPct}%)` : ""}
          </dt>
          <dd className="meta text-accent" data-cart-discount>
            {discount > 0 ? `−${formatMoney(discount)}` : formatMoney(0)}
          </dd>
        </div>
        {subtotal > 0 && subtotal <= CART_DISCOUNT_THRESHOLD ? (
          <p className="text-xs leading-relaxed text-charcoal/45">
            A {discountPct}% courtesy applies when the subtotal exceeds{" "}
            {formatMoney(CART_DISCOUNT_THRESHOLD)}.
          </p>
        ) : null}
        <div className="flex items-end justify-between gap-4 border-t border-charcoal/10 pt-4">
          <dt className="font-display text-xl font-light text-charcoal">Total</dt>
          <dd
            className="font-display text-2xl font-light text-charcoal"
            data-cart-total
          >
            {formatMoney(total)}
          </dd>
        </div>
      </dl>

      {!canCheckout && subtotal > 0 ? (
        <p className="mt-4 border border-accent/25 bg-accent/5 px-3 py-3 text-xs leading-relaxed text-charcoal/70">
          Checkout opens at {formatMoney(CART_MIN_CHECKOUT)}. Add another object
          to reach the minimum.
        </p>
      ) : null}

      {subtotal === 0 ? (
        <p className="mt-4 text-xs leading-relaxed text-charcoal/45">
          Your bag is empty. Objects from the catalogue will gather here.
        </p>
      ) : null}

      <button
        type="button"
        disabled={!canCheckout}
        onClick={onCheckout}
        data-cursor=""
        className={cn(
          "meta mt-6 inline-flex min-h-12 w-full items-center justify-center px-4 py-3.5 transition-all duration-500",
          canCheckout
            ? "bg-ink text-paper hover:bg-accent"
            : "cursor-not-allowed bg-charcoal/15 text-charcoal/35",
        )}
      >
        {canCheckout ? "Checkout" : "Checkout unavailable"}
      </button>
    </div>
  );
}
