import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Star } from "lucide-react";
import type { Product } from "@/lib/api/products";
import {
  CART_MAX_QTY,
  CART_MIN_QTY,
  clampQuantity,
  formatMoney,
} from "@/lib/cart/calculations";
import { useCartStore } from "@/lib/store/cart";
import { qtyButtonClass, ui } from "@/lib/ui";
import { cn } from "@/lib/utils";

interface ProductDetailsProps {
  product: Product;
}

function formatCategory(category: string) {
  return category.replace(/-/g, " ");
}

function safeText(value: string | undefined, fallback = "—") {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function formatDimensions(product: Product) {
  const d = product.dimensions;
  if (!d) return null;
  return `${d.width} × ${d.height} × ${d.depth}`;
}

/**
 * Full-page object study — gallery, purchase controls, metadata, reviews.
 * Cart writes go through the existing Zustand store; product data stays in Query.
 */
export function ProductDetails({ product }: ProductDetailsProps) {
  const addItem = useCartStore((s) => s.addItem);
  const quantityInCart = useCartStore(
    (s) => s.items.find((i) => i.id === product.id)?.quantity ?? 0,
  );

  const gallery = useMemo(() => {
    const sources = product.images.length > 0 ? product.images : [product.thumbnail];
    return Array.from(new Set(sources.filter((src) => Boolean(src?.trim()))));
  }, [product.images, product.thumbnail]);

  const [selectedImage, setSelectedImage] = useState(gallery[0] ?? product.thumbnail);
  const [quantity, setQuantity] = useState(CART_MIN_QTY);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const remaining = Math.max(0, CART_MAX_QTY - quantityInCart);
  const atCartMax = remaining <= 0;
  const canIncrease = quantity < remaining && quantity < CART_MAX_QTY;
  const canDecrease = quantity > CART_MIN_QTY;
  const dimensions = formatDimensions(product);

  useEffect(() => {
    setSelectedImage(gallery[0] ?? product.thumbnail);
    setQuantity(CART_MIN_QTY);
    setAddedFeedback(false);
  }, [product.id, gallery, product.thumbnail]);

  useEffect(() => {
    if (remaining > 0 && quantity > remaining) {
      setQuantity(remaining);
    }
  }, [remaining, quantity]);

  useEffect(() => {
    if (!addedFeedback) return;
    const timer = window.setTimeout(() => setAddedFeedback(false), 2200);
    return () => window.clearTimeout(timer);
  }, [addedFeedback]);

  const onAdd = () => {
    if (atCartMax || remaining <= 0) return;
    const qty = clampQuantity(Math.min(quantity, remaining));
    addItem(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail || selectedImage,
        category: product.category,
      },
      { quantity: qty, openCart: false },
    );
    setAddedFeedback(true);
    setQuantity(CART_MIN_QTY);
  };

  const discount = product.discountPercentage;
  const reviews = product.reviews ?? [];
  const tags = product.tags ?? [];

  return (
    <div className="min-w-0">
      <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-12 lg:gap-16 xl:gap-20">
        <div className="min-w-0">
          <div className="overflow-hidden border border-fg/10 bg-fg/[0.03]">
            <img
              src={selectedImage}
              alt={product.title}
              className="img-tone aspect-[3/4] w-full object-cover"
            />
          </div>

          {gallery.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto overscroll-x-contain pb-1 md:flex-wrap md:overflow-visible">
              {gallery.map((src) => {
                const selected = src === selectedImage;
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setSelectedImage(src)}
                    data-cursor=""
                    aria-label="Select product image"
                    aria-pressed={selected}
                    className={cn(
                      "shrink-0 overflow-hidden border transition-colors duration-300",
                      selected
                        ? "border-accent ring-1 ring-accent"
                        : "border-fg/15 hover:border-fg/40",
                    )}
                  >
                    <img src={src} alt="" className="img-tone size-16 object-cover sm:size-[4.5rem]" />
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="min-w-0 md:pt-2">
          <span className="meta text-accent">Object study</span>
          <h1 className="mt-3 font-display text-4xl leading-[1.08] font-light break-words sm:text-5xl lg:text-6xl">
            {product.title}
          </h1>
          <p className="meta mt-4 capitalize text-fg/45">{formatCategory(product.category)}</p>

          <div className="mt-8 flex flex-wrap items-end gap-x-4 gap-y-2">
            <p className="font-display text-3xl font-light text-fg lg:text-4xl">
              {formatMoney(product.price)}
            </p>
            {typeof discount === "number" && discount > 0 ? (
              <span className="meta text-accent">{discount.toFixed(0)}% off</span>
            ) : null}
          </div>

          <div className="meta mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-fg/55">
            <span className="inline-flex items-center gap-1">
              <Star className="size-3 fill-bronze text-bronze" strokeWidth={0} />
              {product.rating.toFixed(2)}
            </span>
            {typeof product.stock === "number" ? (
              <>
                <span aria-hidden className="size-1 rounded-full bg-fg/25" />
                <span>Stock {product.stock}</span>
              </>
            ) : null}
            {product.availabilityStatus ? (
              <>
                <span aria-hidden className="size-1 rounded-full bg-fg/25" />
                <span>{product.availabilityStatus}</span>
              </>
            ) : null}
          </div>

          <p className="mt-8 max-w-md text-sm leading-relaxed break-words text-fg/65">
            {safeText(product.description, "No description available.")}
          </p>

          <dl className="mt-8 space-y-2.5 border-t border-fg/10 pt-6 text-sm">
            {product.sku ? (
              <div className="flex justify-between gap-4">
                <dt className="meta text-fg/45">SKU</dt>
                <dd className="break-all text-right text-fg/80">{product.sku}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="meta text-fg/45">Category</dt>
              <dd className="capitalize text-right text-fg/80">{formatCategory(product.category)}</dd>
            </div>
            {product.brand ? (
              <div className="flex justify-between gap-4">
                <dt className="meta text-fg/45">Brand</dt>
                <dd className="text-right text-fg/80">{product.brand}</dd>
              </div>
            ) : null}
            {typeof product.weight === "number" ? (
              <div className="flex justify-between gap-4">
                <dt className="meta text-fg/45">Weight</dt>
                <dd className="text-right text-fg/80">{product.weight}</dd>
              </div>
            ) : null}
            {dimensions ? (
              <div className="flex justify-between gap-4">
                <dt className="meta text-fg/45">Dimensions</dt>
                <dd className="text-right text-fg/80">{dimensions}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="meta text-fg/45">Shipping</dt>
              <dd className="max-w-[60%] text-right text-fg/80">
                {safeText(product.shippingInformation)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="meta text-fg/45">Warranty</dt>
              <dd className="max-w-[60%] text-right text-fg/80">
                {safeText(product.warrantyInformation)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="meta text-fg/45">Returns</dt>
              <dd className="max-w-[60%] text-right text-fg/80">
                {safeText(product.returnPolicy)}
              </dd>
            </div>
          </dl>

          {tags.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="meta border border-fg/10 px-2.5 py-1 text-fg/50">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div
              className="inline-flex w-full items-center justify-between border border-fg/15 sm:w-auto"
              role="group"
              aria-label="Quantity to add"
            >
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={!canDecrease || atCartMax}
                onClick={() => setQuantity((q) => clampQuantity(q - 1))}
                data-cursor=""
                className={qtyButtonClass(!canDecrease || atCartMax)}
              >
                <Minus className="size-3" strokeWidth={1.5} />
              </button>
              <span className="meta min-w-9 border-x border-fg/10 px-1 text-center text-fg/80">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={!canIncrease || atCartMax}
                onClick={() => setQuantity((q) => clampQuantity(Math.min(q + 1, remaining)))}
                data-cursor=""
                className={qtyButtonClass(!canIncrease || atCartMax)}
              >
                <Plus className="size-3" strokeWidth={1.5} />
              </button>
            </div>

            <button
              type="button"
              onClick={onAdd}
              disabled={atCartMax}
              data-cursor=""
              className={cn(ui.btnPrimary, "w-full flex-1 sm:min-w-[12rem]")}
            >
              {atCartMax ? `In bag (max ${CART_MAX_QTY})` : "Add to Cart"}
            </button>
          </div>

          {addedFeedback ? (
            <p className={cn(ui.notice, "mt-4")} role="status">
              Added to your selection.
              {quantityInCart > 0 ? ` ${quantityInCart} of ${CART_MAX_QTY} in bag.` : null}
            </p>
          ) : null}

          {!addedFeedback && quantityInCart > 0 ? (
            <p className="mt-4 text-xs leading-relaxed text-fg/50">
              {quantityInCart} already in bag
              {atCartMax
                ? ` — maximum ${CART_MAX_QTY} reached`
                : ` · ${remaining} more available`}
              .
            </p>
          ) : null}
        </div>
      </div>

      {reviews.length > 0 ? (
        <section className="mt-16 border-t border-fg/10 pt-12 md:mt-20 md:pt-16">
          <h2 className="font-display text-2xl font-light text-fg md:text-3xl">Reviews</h2>
          <ul className="mt-8 divide-y divide-fg/10 border-y border-fg/10">
            {reviews.map((review, index) => (
              <li
                key={`${review.reviewerName}-${review.date}-${index}`}
                className="py-6 md:py-7"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="meta text-fg/70">{review.reviewerName}</span>
                  <span className="meta inline-flex items-center gap-1 text-fg/55">
                    <Star className="size-3 fill-bronze text-bronze" strokeWidth={0} />
                    {review.rating.toFixed(1)}
                  </span>
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed break-words text-fg/65">
                  {review.comment}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
