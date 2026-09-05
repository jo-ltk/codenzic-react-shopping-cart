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
  const amountNeeded = Math.max(0, CART_MIN_CHECKOUT - finalTotal);
  const belowMinimum = !canCheckout && !isEmpty;

  return (
    <div data-cart-summary className="pt-1">
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

      {belowMinimum ? (
        <p
          id="cart-checkout-disabled-reason"
          className={ui.notice}
          role="status"
          data-cart-checkout-hint
        >
          Minimum order is {formatMoney(CART_MIN_CHECKOUT)}. Add{" "}
          {formatMoney(amountNeeded)} more to unlock checkout.
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
        data-cart-checkout-cta
        aria-describedby={belowMinimum ? "cart-checkout-disabled-reason" : undefined}
        title={
          !canCheckout
            ? isEmpty
              ? "Add objects before checkout"
              : `Minimum order is ${formatMoney(CART_MIN_CHECKOUT)}`
            : "Continue to shipping"
        }
        className={cn(
          ui.btnPrimaryFull,
          "mt-5 min-h-14 tracking-[0.2em] sm:mt-6 sm:min-h-[3.5rem]",
          canCheckout && "shadow-[0_12px_28px_-18px_rgba(10,22,16,0.65)]",
        )}
      >
        {canCheckout
          ? "Proceed to Checkout"
          : isEmpty
            ? "Bag is empty"
            : "Proceed to Checkout"}
      </button>

      {canCheckout ? (
        <p className="mt-3 text-center text-xs leading-relaxed text-charcoal/45">
          Next: review shipping, confirm payment, place order.
        </p>
      ) : null}
    </div>
  );
}
