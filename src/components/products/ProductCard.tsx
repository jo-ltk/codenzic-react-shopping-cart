import { Star } from "lucide-react";
import type { Product } from "@/lib/api/products";
import { useCartStore } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index: number;
  className?: string;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: price >= 100 ? 0 : 2,
  }).format(price);
}

function formatCategory(category: string) {
  return category.replace(/-/g, " ");
}

export function ProductCard({ product, index, className }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const image = product.images[0] ?? product.thumbnail;
  const pad = String(index + 1).padStart(3, "0");

  const onAdd = () => {
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
        <h3 className="mt-1.5 font-display text-xl leading-snug font-normal md:text-2xl">
          {product.title}
        </h3>

        <div className="meta mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-fg/50">
          <span>{formatCategory(product.category)}</span>
          <span aria-hidden className="size-1 rounded-full bg-fg/30" />
          <span className="inline-flex items-center gap-1 text-fg/60">
            <Star className="size-3 fill-bronze text-bronze" strokeWidth={0} />
            {product.rating.toFixed(2)}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          <span className="meta text-fg/80">{formatPrice(product.price)}</span>
        </div>

        <button
          type="button"
          onClick={onAdd}
          data-cursor=""
          className="meta mt-5 inline-flex min-h-11 w-full items-center justify-center border border-fg/20 px-4 py-3 text-fg transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-accent hover:bg-accent hover:text-paper active:scale-[0.99]"
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}
