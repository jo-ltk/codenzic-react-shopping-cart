import { Star } from "lucide-react";
import type { Product } from "@/lib/api/products";
import { formatMoney } from "@/lib/cart/calculations";
import { CART_MAX_QTY, useCartStore } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index: number;
  className?: string;
}

function formatCategory(category: string) {
  return category.replace(/-/g, " ");
}

export function ProductCard({ product, index, className }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const quantityInCart = useCartStore(
    (s) => s.items.find((i) => i.id === product.id)?.quantity ?? 0,
  );
  const atMax = quantityInCart >= CART_MAX_QTY;
  const image = product.images[0] ?? product.thumbnail;
  const pad = String(index + 1).padStart(3, "0");

  const onAdd = () => {
    if (atMax) return;
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      category: product.category,
    });
  };

  return (
    <article
      data-product-card
      className={cn(
        "group relative flex flex-col will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1",
        className,
      )}
    >
      <span
        aria-hidden
        className="text-outline pointer-events-none absolute -top-[0.4em] left-[-0.05em] z-0 font-display text-[4.5rem] leading-none font-light opacity-40 md:text-[5.5rem]"
      >
        {pad}
      </span>

      <div
        data-cursor="VIEW"
        className="relative z-10 mt-10 overflow-hidden border border-fg/10 md:mt-12"
      >
        <div
          data-product-img
          className="scale-[1.04] will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100"
        >
          <img
            src={image}
            alt={product.title}
            loading="lazy"
            className="img-tone aspect-[3/4] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/35 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      <div className="relative z-10 mt-5 flex flex-1 flex-col">
        <span className="meta text-accent">OBJ-{pad}</span>
        <h3 className="mt-1.5 font-display text-xl leading-snug font-normal break-words md:text-2xl">
          {product.title}
        </h3>

        <div className="meta mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-fg/50">
          <span className="capitalize">{formatCategory(product.category)}</span>
          <span aria-hidden className="size-1 rounded-full bg-fg/30" />
          <span className="inline-flex items-center gap-1 text-fg/60">
            <Star className="size-3 fill-bronze text-bronze" strokeWidth={0} />
            {product.rating.toFixed(2)}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          <span className="meta text-fg/80">{formatMoney(product.price)}</span>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={atMax}
          data-cursor=""
          title={atMax ? `Maximum quantity is ${CART_MAX_QTY}` : "Add to cart"}
          className={cn(
            "meta mt-5 inline-flex min-h-11 w-full items-center justify-center border px-4 py-3 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            atMax
              ? "cursor-not-allowed border-fg/10 text-fg/35"
              : "border-fg/20 text-fg hover:border-accent hover:bg-accent hover:text-paper active:scale-[0.99]",
          )}
        >
          {atMax ? `In bag (max ${CART_MAX_QTY})` : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}
