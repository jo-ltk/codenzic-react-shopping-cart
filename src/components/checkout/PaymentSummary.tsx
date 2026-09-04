import {
  CART_DISCOUNT_RATE,
  CART_TAX_RATE,
  calcLineTotal,
  formatMoney,
  type CartTotals,
} from "@/lib/cart/calculations";
import type { ShippingFormData } from "@/lib/checkout/shippingSchema";
import type { CartItem } from "@/lib/store/cartPersist";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";

interface PaymentSummaryProps {
  items: CartItem[];
  totals: CartTotals;
  shipping: ShippingFormData;
  isPlacingOrder?: boolean;
  onBack: () => void;
  onPlaceOrder: () => void;
}

/** Read-only payment step — shipping + bag lines + calculated totals. */
export function PaymentSummary({
  items,
  totals,
  shipping,
  isPlacingOrder = false,
  onBack,
  onPlaceOrder,
}: PaymentSummaryProps) {
  const taxPct = Math.round(CART_TAX_RATE * 100);
  const discountPct = Math.round(CART_DISCOUNT_RATE * 100);

  return (
    <div className="space-y-6 pb-2">
      <div>
        <span className="meta text-accent">Payment</span>
        <h3 className="mt-1 font-display text-xl font-light text-charcoal sm:text-2xl">
          Review & place order
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-charcoal/55">
          Payment details are reserved for the atelier ledger — no card is charged here.
        </p>
      </div>

      <div className="border border-charcoal/10 px-4 py-4">
        <span className="meta text-charcoal/45">Ship to</span>
        <p className="mt-2 text-sm leading-relaxed break-words text-charcoal">
          {shipping.fullName}
          <br />
          {shipping.address}
          <br />
          {shipping.city}, {shipping.postalCode}
          <br />
          {shipping.email}
          <br />
          {shipping.phone}
        </p>
      </div>

      <div className="border border-charcoal/10 px-4 py-4">
        <span className="meta text-charcoal/45">Objects</span>
        <ul className="mt-3 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 text-sm text-charcoal"
            >
              <div className="min-w-0">
                <p className="font-display text-base leading-snug break-words">
                  {item.title}
                </p>
                <p className="meta mt-1 text-charcoal/45">Qty {item.quantity}</p>
              </div>
              <span className="meta shrink-0 text-charcoal/80">
                {formatMoney(calcLineTotal(item.price, item.quantity))}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border border-charcoal/10 px-4 py-4">
        <span className="meta text-charcoal/45">Payment method</span>
        <p className="mt-2 text-sm text-charcoal">Invoice on delivery — read only</p>
      </div>

      <dl className="space-y-3 border-t border-charcoal/10 pt-4">
        <div className="flex justify-between gap-4">
          <dt className="meta text-charcoal/45">Subtotal</dt>
          <dd className="meta text-charcoal">{formatMoney(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="meta text-charcoal/45">Tax ({taxPct}%)</dt>
          <dd className="meta text-charcoal">{formatMoney(totals.tax)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="meta text-charcoal/45">
            Discount{totals.discount > 0 ? ` (${discountPct}%)` : ""}
          </dt>
          <dd className="meta text-accent">
            {totals.discount > 0
              ? `−${formatMoney(totals.discount)}`
              : formatMoney(0)}
          </dd>
        </div>
        <div className="flex items-end justify-between gap-4 border-t border-charcoal/10 pt-4">
          <dt className="font-display text-xl font-light text-charcoal">Total</dt>
          <dd className="font-display text-2xl font-light text-charcoal">
            {formatMoney(totals.finalTotal)}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          disabled={isPlacingOrder}
          data-cursor=""
          className={cn(ui.btnGhost, "flex-1")}
        >
          Back to shipping
        </button>
        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={items.length === 0 || !totals.canCheckout || isPlacingOrder}
          data-cursor=""
          className={cn(ui.btnPrimary, "flex-1")}
        >
          {isPlacingOrder ? "Placing order…" : "Place Order"}
        </button>
      </div>
    </div>
  );
}
