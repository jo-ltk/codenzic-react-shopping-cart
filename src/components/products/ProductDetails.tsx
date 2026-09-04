import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Check, ChevronDown, Minus, Plus, Star } from "lucide-react";
import type { Product, ProductReview } from "@/lib/api/products";
import {
  CART_MAX_QTY,
  CART_MIN_QTY,
  clampQuantity,
  formatMoney,
} from "@/lib/cart/calculations";
import { useCartStore } from "@/lib/store/cart";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductGrid } from "@/components/products/ProductGrid";
import { qtyButtonClass, ui } from "@/lib/ui";
import { cn } from "@/lib/utils";

interface ProductDetailsProps {
  product: Product;
  related?: Product[];
}

function formatCategory(category: string) {
  return category.replace(/-/g, " ");
}

function safeText(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function formatDimensions(product: Product) {
  const d = product.dimensions;
  if (!d) return null;
  return `${d.width} × ${d.height} × ${d.depth}`;
}

function originalFromDiscount(price: number, discount?: number) {
  if (typeof discount !== "number" || discount <= 0 || discount >= 100) return null;
  return price / (1 - discount / 100);
}

function formatReviewDate(value: string | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function ratingDistribution(reviews: ProductReview[]) {
  return [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => Math.round(review.rating) === star).length,
  }));
}

/**
 * Full-page object study — 50/50 gallery + copy, purchase, accordion, related objects.
 * Cart writes go through the existing Zustand store; product data stays in Query.
 */
export function ProductDetails({ product, related = [] }: ProductDetailsProps) {
  const root = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLParagraphElement>(null);
  const addItem = useCartStore((s) => s.addItem);
  const quantityInCart = useCartStore(
    (s) => s.items.find((i) => i.id === product.id)?.quantity ?? 0,
  );

  const gallery = useMemo(() => {
    const sources = product.images.length > 0 ? product.images : [product.thumbnail];
    return Array.from(new Set(sources.filter((src) => Boolean(src?.trim()))));
  }, [product.images, product.thumbnail]);

  const [quantity, setQuantity] = useState(CART_MIN_QTY);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [openPanels, setOpenPanels] = useState<string[]>(["details"]);

  const remaining = Math.max(0, CART_MAX_QTY - quantityInCart);
  const atCartMax = remaining <= 0;
  const canIncrease = quantity < remaining && quantity < CART_MAX_QTY;
  const canDecrease = quantity > CART_MIN_QTY;
  const dimensions = formatDimensions(product);
  const discount = product.discountPercentage;
  const was = originalFromDiscount(product.price, discount);
  const reviews = product.reviews ?? [];
  const tags = product.tags ?? [];
  const description = safeText(product.description);
  const availability = safeText(product.availabilityStatus);
  const shipping = safeText(product.shippingInformation);
  const returns = safeText(product.returnPolicy);
  const warranty = safeText(product.warrantyInformation);
  const brand = safeText(product.brand);
  const sku = safeText(product.sku);
  const status = availability?.toLowerCase() ?? "";
  const inStock = status
    ? !status.includes("out")
    : typeof product.stock === "number" && product.stock > 0;

  useEffect(() => {
    setQuantity(CART_MIN_QTY);
    setAddedFeedback(false);
    setOpenPanels(["details"]);
  }, [product.id]);

  useEffect(() => {
    if (remaining > 0 && quantity > remaining) {
      setQuantity(remaining);
    }
  }, [remaining, quantity]);

  useEffect(() => {
    if (!addedFeedback) return;
    const timer = window.setTimeout(() => setAddedFeedback(false), 2400);
    return () => window.clearTimeout(timer);
  }, [addedFeedback]);

  useGSAP(
    (_, contextSafe) => {
      if (prefersReducedMotion()) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("[data-study-media]", { autoAlpha: 0, scale: 1.045, duration: 1.15 }).from(
        "[data-study-line]",
        { y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.07 },
        "-=0.75",
      );

      gsap.from("[data-study-reveal]", {
        y: 40,
        autoAlpha: 0,
        duration: 0.95,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-study-below]",
          start: "top 84%",
          once: true,
        },
      });

      const photo = root.current?.querySelector("[data-study-photo]");
      if (photo) {
        gsap.to(photo, {
          yPercent: 4,
          scale: 1.05,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-study-media]",
            start: "top bottom",
            end: "bottom top",
            scrub: 1.4,
          },
        });
      }

      const cta = ctaRef.current;
      if (!cta || !contextSafe) return;

      const onEnter = contextSafe(() => {
        if (cta.disabled) return;
        gsap.to(cta, { y: -2, duration: 0.45, ease: "power2.out", overwrite: "auto" });
      });
      const onLeave = contextSafe(() => {
        gsap.to(cta, { y: 0, duration: 0.55, ease: "power3.out", overwrite: "auto" });
      });

      cta.addEventListener("mouseenter", onEnter);
      cta.addEventListener("mouseleave", onLeave);
      return () => {
        cta.removeEventListener("mouseenter", onEnter);
        cta.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope: root, dependencies: [product.id] },
  );

  useGSAP(
    () => {
      if (!addedFeedback || prefersReducedMotion() || !confirmRef.current) return;
      gsap.fromTo(
        confirmRef.current,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" },
      );
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { scale: 1 },
          { scale: 1.015, duration: 0.28, yoyo: true, repeat: 1, ease: "power2.inOut" },
        );
      }
    },
    { dependencies: [addedFeedback] },
  );

  const onAdd = () => {
    if (atCartMax || remaining <= 0) return;
    const qty = clampQuantity(Math.min(quantity, remaining));
    addItem(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail || gallery[0],
        category: product.category,
      },
      { quantity: qty, openCart: false },
    );
    setAddedFeedback(true);
    setQuantity(CART_MIN_QTY);
  };

  const togglePanel = (id: string) => {
    setOpenPanels((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  return (
    <div ref={root} className="min-w-0">
      <section className="grid grid-cols-1 border-y border-fg/15 lg:grid-cols-2 lg:items-stretch">
        <div
          data-study-media
          className="min-w-0 overflow-hidden lg:min-h-[calc(100svh-8.5rem)] lg:border-r lg:border-fg/20"
        >
          <ProductGallery
            key={product.id}
            images={gallery}
            title={product.title}
            className="lg:h-full"
          />
        </div>

        <div
          data-study-copy
          className="flex min-w-0 flex-col justify-between px-5 py-10 sm:px-8 sm:py-12 lg:min-h-[calc(100svh-8.5rem)] lg:px-12 lg:py-12 xl:px-16 xl:py-14"
        >
          <div>
            <p data-study-line className="meta text-fg/45">
              <span>Catalogue</span>
              <span className="mx-2 text-fg/25">/</span>
              <span className="capitalize">{formatCategory(product.category)}</span>
            </p>

            <p data-study-line className="meta mt-8 text-accent">
              Object study
            </p>
            <h1
              data-study-line
              className="mt-3 font-display text-4xl leading-[1.06] font-light break-words sm:text-5xl xl:text-6xl"
            >
              {product.title}
            </h1>
            <p data-study-line className="meta mt-4 capitalize text-fg/45">
              {formatCategory(product.category)}
            </p>

            <div data-study-line className="meta mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-fg/55">
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-3 fill-bronze text-bronze" strokeWidth={0} />
                {product.rating.toFixed(2)}
              </span>
              <span aria-hidden className="size-1 rounded-full bg-fg/25" />
              <span>
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </span>
            </div>

            <div data-study-line className="mt-8 flex flex-wrap items-end gap-x-4 gap-y-2">
              <p className="font-display text-3xl font-light text-fg lg:text-4xl">
                {formatMoney(product.price)}
              </p>
              {was ? (
                <span className="font-display text-lg font-light text-fg/35 line-through">
                  {formatMoney(was)}
                </span>
              ) : null}
              {typeof discount === "number" && discount > 0 ? (
                <span className="meta text-accent">{discount.toFixed(0)}% off</span>
              ) : null}
            </div>

            {description ? (
              <p data-study-line className="mt-8 max-w-md text-sm leading-relaxed break-words text-fg/65">
                {description}
              </p>
            ) : null}

            <dl data-study-line className="mt-10 space-y-3 border-t border-fg/10 pt-8">
              {availability || typeof product.stock === "number" ? (
                <MetaRow label="Availability">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        inStock ? "bg-sage" : "bg-fg/30",
                      )}
                    />
                    {availability ?? (inStock ? "In stock" : "Unavailable")}
                    {typeof product.stock === "number" ? ` · ${product.stock}` : null}
                  </span>
                </MetaRow>
              ) : null}
              {sku ? <MetaRow label="SKU">{sku}</MetaRow> : null}
              {brand ? <MetaRow label="Brand">{brand}</MetaRow> : null}
              {dimensions ? <MetaRow label="Dimensions">{dimensions}</MetaRow> : null}
              {typeof product.weight === "number" ? (
                <MetaRow label="Weight">{product.weight}</MetaRow>
              ) : null}
              {shipping ? <MetaRow label="Shipping">{shipping}</MetaRow> : null}
              {returns ? <MetaRow label="Returns">{returns}</MetaRow> : null}
              {warranty ? <MetaRow label="Warranty">{warranty}</MetaRow> : null}
            </dl>

            {tags.length > 0 ? (
              <div data-study-line className="mt-6 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="meta border border-fg/10 px-2.5 py-1 text-fg/50">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div data-study-line className="mt-12 hidden lg:block">
            <PurchaseBlock
              quantity={quantity}
              canDecrease={canDecrease}
              canIncrease={canIncrease}
              atCartMax={atCartMax}
              addedFeedback={addedFeedback}
              quantityInCart={quantityInCart}
              remaining={remaining}
              availability={availability}
              inStock={inStock}
              stock={product.stock}
              ctaRef={ctaRef}
              confirmRef={confirmRef}
              onDecrease={() => setQuantity((q) => clampQuantity(q - 1))}
              onIncrease={() => setQuantity((q) => clampQuantity(Math.min(q + 1, remaining)))}
              onAdd={onAdd}
            />
          </div>
        </div>
      </section>

      <div
        data-study-below
        className="px-5 pt-16 pb-32 sm:px-8 md:px-10 md:pt-24 lg:px-14 lg:pb-36 xl:px-16"
      >
        <div data-study-reveal className="border-t border-fg/15">
          <AccordionPanel
            id="details"
            title="Product Details"
            open={openPanels.includes("details")}
            onToggle={togglePanel}
          >
            <p className="max-w-2xl text-sm leading-relaxed text-fg/65">
              {description ?? "No further notes for this object."}
            </p>
          </AccordionPanel>

          <AccordionPanel
            id="specs"
            title="Materials / Specifications"
            open={openPanels.includes("specs")}
            onToggle={togglePanel}
          >
            <dl className="grid max-w-2xl grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
              {sku ? <SpecRow label="SKU" value={sku} /> : null}
              <SpecRow label="Category" value={formatCategory(product.category)} />
              {brand ? <SpecRow label="Brand" value={brand} /> : null}
              {dimensions ? <SpecRow label="Dimensions" value={dimensions} /> : null}
              {typeof product.weight === "number" ? (
                <SpecRow label="Weight" value={String(product.weight)} />
              ) : null}
              {typeof product.stock === "number" ? (
                <SpecRow label="Stock" value={String(product.stock)} />
              ) : null}
            </dl>
          </AccordionPanel>

          <AccordionPanel
            id="shipping"
            title="Shipping & Returns"
            open={openPanels.includes("shipping")}
            onToggle={togglePanel}
          >
            <div className="grid max-w-2xl gap-6 sm:grid-cols-3">
              <Note title="Shipping" body={shipping} />
              <Note title="Returns" body={returns} />
              <Note title="Warranty" body={warranty} />
            </div>
          </AccordionPanel>

          <AccordionPanel
            id="reviews"
            title="Reviews"
            open={openPanels.includes("reviews")}
            onToggle={togglePanel}
          >
            <ReviewsPanel rating={product.rating} reviews={reviews} />
          </AccordionPanel>
        </div>

        {related.length > 0 ? (
          <section data-study-reveal className="mt-20 border-t border-fg/15 pt-14 md:mt-28 md:pt-20">
            <p className="meta text-fg/45">The collection</p>
            <h2 className="mt-3 font-display text-3xl font-light text-fg md:text-4xl lg:text-5xl">
              More Objects
            </h2>
            <div className="mt-10 md:mt-14">
              <ProductGrid
                products={related}
                animateKey={`related-${product.id}`}
                className="grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4"
              />
            </div>
          </section>
        ) : null}
      </div>

      <div className="sticky bottom-0 z-40 border-t border-fg/15 bg-paper/95 px-5 py-3 backdrop-blur-sm sm:px-8 lg:hidden">
        <div className="mb-3 flex items-center justify-between gap-4">
          <span className="font-display text-xl font-light">{formatMoney(product.price)}</span>
          {availability ? <span className="meta text-fg/50">{availability}</span> : null}
        </div>
        <PurchaseBlock
          compact
          quantity={quantity}
          canDecrease={canDecrease}
          canIncrease={canIncrease}
          atCartMax={atCartMax}
          addedFeedback={addedFeedback}
          quantityInCart={quantityInCart}
          remaining={remaining}
          availability={availability}
          inStock={inStock}
          stock={product.stock}
          onDecrease={() => setQuantity((q) => clampQuantity(q - 1))}
          onIncrease={() => setQuantity((q) => clampQuantity(Math.min(q + 1, remaining)))}
          onAdd={onAdd}
        />
      </div>
    </div>
  );
}

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-6 text-sm">
      <dt className="meta shrink-0 text-fg/45">{label}</dt>
      <dd className="max-w-[70%] text-right leading-relaxed break-words text-fg/80">{children}</dd>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-fg/10 py-2.5">
      <dt className="meta text-fg/45">{label}</dt>
      <dd className="text-right text-sm capitalize text-fg/75">{value}</dd>
    </div>
  );
}

function Note({ title, body }: { title: string; body: string | null }) {
  return (
    <div>
      <p className="meta text-fg/45">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-fg/65">{body ?? "—"}</p>
    </div>
  );
}

function AccordionPanel({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  open: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-fg/15">
      <button
        type="button"
        data-cursor=""
        aria-expanded={open}
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between gap-4 py-6 text-left md:py-7"
      >
        <span className="font-display text-2xl font-light md:text-3xl">{title}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-fg/50 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open && "rotate-180",
          )}
          strokeWidth={1.25}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-8 md:pb-10">{children}</div>
        </div>
      </div>
    </div>
  );
}

function ReviewsPanel({ rating, reviews }: { rating: number; reviews: ProductReview[] }) {
  const distribution = ratingDistribution(reviews);
  const maxCount = Math.max(1, ...distribution.map((row) => row.count));

  return (
    <div>
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
        <div className="shrink-0">
          <p className="font-display text-5xl font-light leading-none">{rating.toFixed(2)}</p>
          <div className="mt-3 inline-flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={cn(
                  "size-3.5",
                  i < Math.round(rating) ? "fill-bronze text-bronze" : "text-fg/20",
                )}
                strokeWidth={i < Math.round(rating) ? 0 : 1.25}
              />
            ))}
          </div>
          <p className="meta mt-3 text-fg/45">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>

        {reviews.length > 0 ? (
          <ul className="min-w-0 flex-1 space-y-2">
            {distribution.map((row) => (
              <li key={row.star} className="flex items-center gap-3">
                <span className="meta w-4 text-fg/45">{row.star}</span>
                <span className="h-px flex-1 bg-fg/10">
                  <span
                    className="block h-px bg-bronze/70"
                    style={{ width: `${(row.count / maxCount) * 100}%` }}
                  />
                </span>
                <span className="meta w-6 text-right text-fg/40">{row.count}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {reviews.length > 0 ? (
        <ul className="mt-10 divide-y divide-fg/10 border-y border-fg/10">
          {reviews.map((review, index) => {
            const date = formatReviewDate(review.date);
            return (
              <li key={`${review.reviewerName}-${review.date}-${index}`} className="py-6 md:py-7">
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
                {date ? <p className="meta mt-3 text-fg/35">{date}</p> : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-8 text-sm text-fg/50">No reviews for this object yet.</p>
      )}
    </div>
  );
}

function PurchaseBlock({
  quantity,
  canDecrease,
  canIncrease,
  atCartMax,
  addedFeedback,
  quantityInCart,
  remaining,
  availability,
  inStock,
  stock,
  compact = false,
  ctaRef,
  confirmRef,
  onDecrease,
  onIncrease,
  onAdd,
}: {
  quantity: number;
  canDecrease: boolean;
  canIncrease: boolean;
  atCartMax: boolean;
  addedFeedback: boolean;
  quantityInCart: number;
  remaining: number;
  availability: string | null;
  inStock: boolean;
  stock?: number;
  compact?: boolean;
  ctaRef?: RefObject<HTMLButtonElement | null>;
  confirmRef?: RefObject<HTMLParagraphElement | null>;
  onDecrease: () => void;
  onIncrease: () => void;
  onAdd: () => void;
}) {
  return (
    <div className={cn(!compact && "border border-fg/15 p-5 sm:p-6")}>
      <div className={cn("flex flex-col gap-3", compact ? "sm:flex-row sm:items-center" : "sm:flex-row sm:items-stretch")}>
        <div
          className="inline-flex w-full items-center justify-between border border-fg/15 sm:w-auto"
          role="group"
          aria-label="Quantity to add"
        >
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={!canDecrease || atCartMax}
            onClick={onDecrease}
            data-cursor=""
            className={qtyButtonClass(!canDecrease || atCartMax)}
          >
            <Minus className="size-3" strokeWidth={1.5} />
          </button>
          <span className="meta min-w-10 border-x border-fg/10 px-2 text-center text-fg/80">
            {String(quantity).padStart(2, "0")}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={!canIncrease || atCartMax}
            onClick={onIncrease}
            data-cursor=""
            className={qtyButtonClass(!canIncrease || atCartMax)}
          >
            <Plus className="size-3" strokeWidth={1.5} />
          </button>
        </div>

        <button
          ref={ctaRef}
          type="button"
          onClick={onAdd}
          disabled={atCartMax}
          data-cursor=""
          className={cn(ui.btnPrimary, "w-full min-h-12 flex-1 sm:min-h-14")}
        >
          {atCartMax ? (
            `In bag (max ${CART_MAX_QTY})`
          ) : addedFeedback ? (
            <span className="inline-flex items-center gap-2">
              <Check className="size-3.5" strokeWidth={1.5} />
              Added
            </span>
          ) : (
            "Add to Cart"
          )}
        </button>
      </div>

      <p className="meta mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-fg/45">
        <span className="inline-flex items-center gap-2">
          <span className={cn("size-1.5 rounded-full", inStock ? "bg-sage" : "bg-fg/30")} />
          {availability ?? (inStock ? "Available" : "Unavailable")}
        </span>
        {typeof stock === "number" ? (
          <>
            <span aria-hidden className="size-1 rounded-full bg-fg/20" />
            <span>{stock} in atelier</span>
          </>
        ) : null}
      </p>

      {addedFeedback ? (
        <p ref={confirmRef} className={cn(ui.notice, "mt-4")} role="status">
          Added to your selection.
          {quantityInCart > 0 ? ` ${quantityInCart} of ${CART_MAX_QTY} in bag.` : null}
        </p>
      ) : null}

      {!addedFeedback && quantityInCart > 0 ? (
        <p className="mt-3 text-xs leading-relaxed text-fg/50">
          {quantityInCart} already in bag
          {atCartMax ? ` — maximum ${CART_MAX_QTY} reached` : ` · ${remaining} more available`}.
        </p>
      ) : null}
    </div>
  );
}
