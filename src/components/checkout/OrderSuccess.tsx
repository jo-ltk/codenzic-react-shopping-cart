import { formatMoney } from "@/lib/cart/calculations";

interface OrderSuccessProps {
  orderTotal: number;
  orderReference: string;
  onContinueShopping: () => void;
}

/** Post-order confirmation — kept in checkout React state after the bag clears. */
export function OrderSuccess({
  orderTotal,
  orderReference,
  onContinueShopping,
}: OrderSuccessProps) {
  return (
    <div className="flex flex-col items-center py-10 text-center sm:py-14">
      <span className="meta text-accent">Confirmed</span>
      <h3 className="mt-4 font-display text-3xl leading-snug font-light text-charcoal sm:text-4xl">
        Order placed
        <br />
        <em className="text-accent">successfully.</em>
      </h3>
      <p className="mt-5 max-w-sm text-sm leading-relaxed text-charcoal/55">
        Order placed successfully. A quiet confirmation is on its way.
      </p>

      <dl className="mt-8 w-full max-w-xs space-y-3 border border-charcoal/10 px-5 py-5 text-left">
        <div className="flex items-start justify-between gap-4">
          <dt className="meta text-charcoal/45">Reference</dt>
          <dd className="meta text-right text-charcoal">{orderReference}</dd>
        </div>
        <div className="flex items-end justify-between gap-4 border-t border-charcoal/10 pt-3">
          <dt className="meta text-charcoal/45">Total</dt>
          <dd className="font-display text-xl font-light text-charcoal">
            {formatMoney(orderTotal)}
          </dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={onContinueShopping}
        data-cursor=""
        className="meta mt-10 inline-flex min-h-11 items-center justify-center bg-ink px-7 py-3 text-paper transition-colors duration-300 hover:bg-accent"
      >
        Continue Shopping
      </button>
    </div>
  );
}
