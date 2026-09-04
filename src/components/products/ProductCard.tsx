import { useState, type MouseEvent } from "react";
import { Link } from "react-router";
import { Star } from "lucide-react";
import type { Product } from "@/lib/api/products";
import { formatMoney } from "@/lib/cart/calculations";
import { CART_MAX_QTY, useCartStore } from "@/lib/store/cart";
import { STUDIO_BACKDROP } from "@/components/products/ProductGallery";
import { cn } from "@/lib/utils";

export type ProductCardLayout = "grid" | "list";

interface ProductCardProps {
  product: Product;
  index: number;
  layout?: ProductCardLayout;
  className?: string;
}

function formatCategory(category: string) {
  return category.replace(/-/g, " ");
}

function padObject(n: number) {
  return String(n).padStart(3, "0");
}

function padPlate(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Studio plate card — same photographic language as the object study page.
 */
export function ProductCard({
  product,
  index,
  layout = "grid",
  className,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const quantityInCart = useCartStore(
    (s) => s.items.find((i) => i.id === product.id)?.quantity ?? 0,
  );
  const atMax = quantityInCart >= CART_MAX_QTY;
  const image = product.images[0] ?? product.thumbnail;
  const objectIndex = padObject(product.id);
  const plateIndex = padPlate(index + 1);
  const [justAdded, setJustAdded] = useState(false);
  const isList = layout === "list";

  const onAdd = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (atMax) return;
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail || image,
      category: product.category,
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  };

  const plate = (
    <Link
      to={`/catalogue/${product.id}`}
      data-cursor="VIEW"
      className={cn(
        "group/plate relative block overflow-hidden border border-fg/10 text-left",
        STUDIO_BACKDROP,
        isList ? "aspect-[4/5] w-full sm:aspect-[4/3] sm:w-[min(42%,18rem)] sm:shrink-0" : "w-full",
      )}
    >
      <div
        data-product-img
        className={cn(
          "will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isList ? "absolute inset-0" : "relative aspect-[4/5]",
        )}
      >
        <img
          src={image}
          alt={product.title}
          loading="lazy"
          className="img-tone absolute inset-0 h-full w-full object-contain p-[12%] mix-blend-multiply transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/plate:scale-[1.04]"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(140%_120%_at_50%_50%,transparent_55%,rgba(23,20,15,0.08)_100%)]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 sm:p-4">
        <span className="meta text-fg/50">
          Plate {plateIndex}
          <span className="mx-1.5 text-fg/25">/</span>
          OBJ-{objectIndex}
        </span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-3 sm:p-4">
        <span className="meta text-fg/40 capitalize">{formatCategory(product.category)}</span>
        <span className="meta text-fg/45 opacity-0 transition-opacity duration-500 group-hover/plate:opacity-100">
          View
        </span>
      </div>
    </Link>
  );

  const meta = (
    <>
      <Link to={`/catalogue/${product.id}`} className="text-left" data-cursor="">
        <p className="meta flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-accent">Object N° {objectIndex}</span>
          {!isList ? (
            <>
              <span aria-hidden className="size-1 rounded-full bg-fg/25" />
              <span className="capitalize text-fg/45">{formatCategory(product.category)}</span>
            </>
          ) : null}
        </p>
        <h3
          className={cn(
            "mt-3 font-display leading-[1.1] font-light tracking-[-0.01em] break-words text-fg",
            isList ? "text-2xl sm:text-3xl md:text-[2rem]" : "text-xl md:text-2xl",
          )}
        >
          {product.title}
        </h3>
      </Link>

      <div className="meta mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-fg/50">
        <span className="inline-flex items-center gap-1.5 text-fg/70">
          <Star className="size-3 fill-bronze text-bronze" strokeWidth={0} />
          {product.rating.toFixed(2)}
        </span>
        {product.brand ? (
          <>
            <span aria-hidden className="size-1 rounded-full bg-fg/25" />
            <span className="text-fg/45">by {product.brand}</span>
          </>
        ) : null}
      </div>

      <div
        className={cn(
          "flex items-end justify-between gap-4",
          isList ? "mt-6 sm:mt-auto sm:pt-8" : "mt-auto pt-6",
        )}
      >
        <p className="font-display text-2xl leading-none font-light text-fg md:text-[1.75rem]">
          {formatMoney(product.price)}
        </p>
      </div>

      <button
        type="button"
        onClick={onAdd}
        disabled={atMax}
        data-cursor=""
        title={atMax ? `Maximum quantity is ${CART_MAX_QTY}` : "Add to cart"}
        className={cn(
          "meta group/cta relative mt-5 inline-flex min-h-11 w-full items-center justify-center overflow-hidden px-4 py-3 transition-colors duration-500",
          isList && "sm:mt-6 sm:max-w-[14rem]",
          atMax
            ? "cursor-not-allowed bg-charcoal/10 text-charcoal/35"
            : "bg-ink text-paper hover:bg-accent",
        )}
      >
        {atMax
          ? `In bag (max ${CART_MAX_QTY})`
          : justAdded
            ? "Added"
            : "Add to Cart"}
      </button>
    </>
  );

  return (
    <article
      data-product-card
      className={cn(
        "group relative will-change-transform",
        isList
          ? "flex flex-col gap-6 border border-fg/10 p-4 sm:flex-row sm:items-stretch sm:gap-8 sm:p-5 md:gap-10 md:p-6"
          : "flex flex-col",
        className,
      )}
    >
      {plate}
      <div className={cn("relative z-10 flex flex-1 flex-col", isList ? "min-w-0 py-1" : "mt-5")}>
        {meta}
      </div>
    </article>
  );
}
