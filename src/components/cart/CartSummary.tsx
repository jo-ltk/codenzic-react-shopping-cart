import {
  CART_DISCOUNT_RATE,
  CART_DISCOUNT_THRESHOLD,
  CART_MIN_CHECKOUT,
  CART_TAX_RATE,
  formatMoney,
  type CartTotals,
} from "@/lib/cart/calculations";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";

interface CartSummaryProps {
  totals: CartTotals;
  onCheckout?: () => void;
}

export function CartSummary({ totals, onCheckout }: CartSummaryProps) {
  const { subtotal, tax, discount, finalTotal, canCheckout, itemCount } = totals;
  const discountPct = Math.round(CART_DISCOUNT_RATE * 100);
  const taxPct = Math.round(CART_TAX_RATE * 100);
  const isEmpty = itemCount === 0 || subtotal === 0;

  return (
    <div data-cart-summary className="border-t border-charcoal/15 pt-5 sm:pt-6">
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
            {formatMoney(finalTotal)}
          </dd>
        </div>
      </dl>

      {!canCheckout && !isEmpty ? (
        <p className={ui.notice} role="status">
          Checkout is disabled below {formatMoney(CART_MIN_CHECKOUT)}. Add another
          object so the final total reaches the minimum.
        </p>
      ) : null}

      {isEmpty ? (
        <p className="mt-4 text-xs leading-relaxed text-charcoal/45">
          Your bag is empty. Objects from the catalogue will gather here.
        </p>
      ) : null}

      <button
        type="button"
        disabled={!canCheckout}
        onClick={onCheckout}
        data-cursor=""
        title={
          !canCheckout
            ? isEmpty
              ? "Add objects before checkout"
              : `Minimum order is ${formatMoney(CART_MIN_CHECKOUT)}`
            : "Continue to shipping"
        }
        className={cn(ui.btnPrimaryFull, "mt-6")}
      >
        {canCheckout
          ? "Checkout"
          : isEmpty
            ? "Bag is empty"
            : "Checkout unavailable"}
      </button>
    </div>
  );
}
