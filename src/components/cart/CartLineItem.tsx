import { Minus, Plus, X } from "lucide-react";
import {
  CART_MAX_QTY,
  CART_MIN_QTY,
  calcLineTotal,
  formatMoney,
} from "@/lib/cart/calculations";
import { type CartItem, useCartStore } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

interface CartLineItemProps {
  item: CartItem;
}

function formatCategory(category: string) {
  return category.replace(/-/g, " ");
}

export function CartLineItem({ item }: CartLineItemProps) {
  const increaseQuantity = useCartStore((s) => s.increaseQuantity);
  const decreaseQuantity = useCartStore((s) => s.decreaseQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const lineTotal = calcLineTotal(item.price, item.quantity);
  const atMin = item.quantity <= CART_MIN_QTY;
  const atMax = item.quantity >= CART_MAX_QTY;

  return (
    <article
      data-cart-item
      className="grid grid-cols-[5rem_1fr] gap-4 border-b border-charcoal/10 py-5 sm:grid-cols-[6.5rem_1fr] sm:gap-5"
    >
      <div className="overflow-hidden border border-charcoal/10">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="img-tone aspect-[3/4] h-full w-full object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-lg leading-snug font-normal text-charcoal sm:text-xl">
              {item.title}
            </h3>
            <p className="meta mt-1.5 text-charcoal/45">{formatCategory(item.category)}</p>
          </div>
          <button
            type="button"
            aria-label={`Remove ${item.title}`}
            onClick={() => removeItem(item.id)}
            data-cursor=""
            className="shrink-0 p-1 text-charcoal/40 transition-colors duration-300 hover:text-accent"
          >
            <X className="size-3.5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="inline-flex items-center border border-charcoal/15">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={atMin}
              onClick={() => decreaseQuantity(item.id)}
              data-cursor=""
              className={cn(
                "inline-flex size-9 items-center justify-center text-charcoal transition-colors duration-300",
                atMin
                  ? "cursor-not-allowed opacity-30"
                  : "hover:bg-charcoal/5 hover:text-accent",
              )}
            >
              <Minus className="size-3" strokeWidth={1.5} />
            </button>
            <span className="meta min-w-8 text-center text-charcoal/80" data-cart-qty>
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={atMax}
              onClick={() => increaseQuantity(item.id)}
              data-cursor=""
              className={cn(
                "inline-flex size-9 items-center justify-center text-charcoal transition-colors duration-300",
                atMax
                  ? "cursor-not-allowed opacity-30"
                  : "hover:bg-charcoal/5 hover:text-accent",
              )}
            >
              <Plus className="size-3" strokeWidth={1.5} />
            </button>
          </div>

          <div className="text-right">
            <span className="meta text-charcoal/40">{formatMoney(item.price)} each</span>
            <p className="meta mt-1 text-charcoal" data-cart-line-total>
              {formatMoney(lineTotal)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
