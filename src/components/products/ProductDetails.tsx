import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Star, X } from "lucide-react";
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
  onClose: () => void;
}

function formatCategory(category: string) {
  return category.replace(/-/g, " ");
}

function safeText(value: string | undefined, fallback = "—") {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

/**
 * Product details overlay — editorial paper panel matching the cart drawer.
 * Shows DummyJSON fields that actually exist; no invented variants.
 */
export function ProductDetails({ product, onClose }: ProductDetailsProps) {
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [onClose]);

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
    <div className="fixed inset-0 z-[95]" role="presentation">
      <button
        type="button"
        aria-label="Close product details"
        onClick={onClose}
        className="absolute inset-0 bg-ink/55"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={product.title}
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-paper text-charcoal shadow-[-24px_0_60px_-40px_rgba(10,22,16,0.45)] sm:max-w-2xl lg:max-w-3xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-charcoal/10 px-5 py-5 sm:px-7 sm:py-6">
          <div className="min-w-0">
            <span className="meta text-accent">Object study</span>
            <h2 className="mt-1 font-display text-2xl leading-snug font-light break-words sm:text-3xl">
              {product.title}
            </h2>
            <p className="meta mt-2 capitalize text-charcoal/45">
              {formatCategory(product.category)}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close product details"
            onClick={onClose}
            data-cursor=""
            className="inline-flex size-10 shrink-0 items-center justify-center border border-charcoal/15 text-charcoal transition-colors duration-300 hover:border-accent hover:text-accent"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7 sm:py-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
            <div>
              <div className="overflow-hidden border border-charcoal/10 bg-charcoal/[0.03]">
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="img-tone aspect-[3/4] w-full object-cover"
                />
              </div>

              {gallery.length > 1 ? (
                <div className="mt-3 flex flex-wrap gap-2">
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
                          "overflow-hidden border transition-colors duration-300",
                          selected
                            ? "border-accent ring-1 ring-accent"
                            : "border-charcoal/15 hover:border-charcoal/40",
                        )}
                      >
                        <img
                          src={src}
                          alt=""
                          className="img-tone size-14 object-cover sm:size-16"
                        />
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
                <p className="font-display text-3xl font-light text-charcoal">
                  {formatMoney(product.price)}
                </p>
                {typeof discount === "number" && discount > 0 ? (
                  <span className="meta text-accent">{discount.toFixed(0)}% off</span>
                ) : null}
              </div>

              <div className="meta mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-charcoal/55">
                <span className="inline-flex items-center gap-1">
                  <Star className="size-3 fill-bronze text-bronze" strokeWidth={0} />
                  {product.rating.toFixed(2)}
                </span>
                {typeof product.stock === "number" ? (
                  <>
                    <span aria-hidden className="size-1 rounded-full bg-charcoal/25" />
                    <span>Stock {product.stock}</span>
                  </>
                ) : null}
                {product.availabilityStatus ? (
                  <>
                    <span aria-hidden className="size-1 rounded-full bg-charcoal/25" />
                    <span>{product.availabilityStatus}</span>
                  </>
                ) : null}
              </div>

              <p className="mt-6 text-sm leading-relaxed break-words text-charcoal/65">
                {safeText(product.description, "No description available.")}
              </p>

              <dl className="mt-6 space-y-2.5 border-t border-charcoal/10 pt-5 text-sm">
                {product.sku ? (
                  <div className="flex justify-between gap-4">
                    <dt className="meta text-charcoal/45">SKU</dt>
                    <dd className="break-all text-right text-charcoal/80">{product.sku}</dd>
                  </div>
                ) : null}
                {product.brand ? (
                  <div className="flex justify-between gap-4">
                    <dt className="meta text-charcoal/45">Brand</dt>
                    <dd className="text-right text-charcoal/80">{product.brand}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-4">
                  <dt className="meta text-charcoal/45">Shipping</dt>
                  <dd className="max-w-[60%] text-right text-charcoal/80">
                    {safeText(product.shippingInformation)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="meta text-charcoal/45">Warranty</dt>
                  <dd className="max-w-[60%] text-right text-charcoal/80">
                    {safeText(product.warrantyInformation)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="meta text-charcoal/45">Returns</dt>
                  <dd className="max-w-[60%] text-right text-charcoal/80">
                    {safeText(product.returnPolicy)}
                  </dd>
                </div>
              </dl>

              {tags.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="meta border border-charcoal/10 px-2.5 py-1 text-charcoal/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div
                  className="inline-flex items-center border border-charcoal/15"
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
                  <span className="meta min-w-9 border-x border-charcoal/10 px-1 text-center text-charcoal/80">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={!canIncrease || atCartMax}
                    onClick={() =>
                      setQuantity((q) => clampQuantity(Math.min(q + 1, remaining)))
                    }
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
                  className={cn(ui.btnPrimary, "min-w-[10rem] flex-1")}
                >
                  {atCartMax ? `In bag (max ${CART_MAX_QTY})` : "Add to Cart"}
                </button>
              </div>

              {addedFeedback ? (
                <p className={cn(ui.notice, "mt-4")} role="status">
                  Added to your selection.
                  {quantityInCart > 0
                    ? ` ${quantityInCart} of ${CART_MAX_QTY} in bag.`
                    : null}
                </p>
              ) : null}

              {!addedFeedback && quantityInCart > 0 ? (
                <p className="mt-4 text-xs leading-relaxed text-charcoal/50">
                  {quantityInCart} already in bag
                  {atCartMax ? ` — maximum ${CART_MAX_QTY} reached` : ` · ${remaining} more available`}.
                </p>
              ) : null}
            </div>
          </div>

          {reviews.length > 0 ? (
            <section className="mt-10 border-t border-charcoal/10 pt-8">
              <h3 className="font-display text-xl font-light text-charcoal">Reviews</h3>
              <ul className="mt-5 space-y-4">
                {reviews.map((review, index) => (
                  <li
                    key={`${review.reviewerName}-${review.date}-${index}`}
                    className="border border-charcoal/10 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="meta text-charcoal/70">{review.reviewerName}</span>
                      <span className="meta inline-flex items-center gap-1 text-charcoal/55">
                        <Star className="size-3 fill-bronze text-bronze" strokeWidth={0} />
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed break-words text-charcoal/65">
                      {review.comment}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
