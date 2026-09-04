import { formatMoney } from "@/lib/cart/calculations";

interface OrderSuccessProps {
  orderTotal: number;
  onClose: () => void;
}

export function OrderSuccess({ orderTotal, onClose }: OrderSuccessProps) {
  return (
    <div className="flex flex-col items-center py-10 text-center sm:py-14">
      <span className="meta text-accent">Confirmed</span>
      <h3 className="mt-4 font-display text-3xl leading-snug font-light text-charcoal sm:text-4xl">
        Your objects
        <br />
        <em className="text-accent">are reserved.</em>
      </h3>
      <p className="mt-5 max-w-xs text-sm leading-relaxed text-charcoal/55">
        Thank you. A quiet confirmation is on its way. Total settled:{" "}
        {formatMoney(orderTotal)}.
      </p>
      <button
        type="button"
        onClick={onClose}
        data-cursor=""
        className="meta mt-10 inline-flex min-h-11 items-center justify-center border border-charcoal/15 px-7 py-3 text-charcoal transition-colors duration-300 hover:border-accent hover:text-accent"
      >
        Return to the catalogue
      </button>
    </div>
  );
}
