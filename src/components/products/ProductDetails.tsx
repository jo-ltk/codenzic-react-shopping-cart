import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { ArrowUpRight, Check, Minus, Plus, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import type { Product } from "@/lib/api/products";
import {
  CART_MAX_QTY,
  CART_MIN_QTY,
  clampQuantity,
  formatMoney,
} from "@/lib/cart/calculations";
import { useCartStore } from "@/lib/store/cart";
import { gsap, isFinePointer, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/motion";
import { ProductGallery, STUDIO_BACKDROP } from "@/components/products/ProductGallery";
import { ProductPlates } from "@/components/products/ProductPlates";
import { ProductDossier } from "@/components/products/ProductDossier";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ScrubWords } from "@/components/ScrubWords";
import { qtyButtonClass } from "@/lib/ui";
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

function originalFromDiscount(price: number, discount?: number) {
  if (typeof discount !== "number" || discount <= 0 || discount >= 100) return null;
  return price / (1 - discount / 100);
}

/**
 * Object page in five acts — plate, statement, plates, dossier, collection.
 * Cart writes go through the existing Zustand store; product data stays in Query.
 */
export function ProductDetails({ product, related = [] }: ProductDetailsProps) {
  const root = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const purchaseRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((s) => s.addItem);
  const openCheckout = useCartStore((s) => s.openCheckout);
  const quantityInCart = useCartStore(
    (s) => s.items.find((i) => i.id === product.id)?.quantity ?? 0,
  );

  const gallery = useMemo(() => {
    const sources = product.images.length > 0 ? product.images : [product.thumbnail];
    return Array.from(new Set(sources.filter((src) => Boolean(src?.trim()))));
  }, [product.images, product.thumbnail]);

  const [quantity, setQuantity] = useState(CART_MIN_QTY);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const remaining = Math.max(0, CART_MAX_QTY - quantityInCart);
  const atCartMax = remaining <= 0;
  const canIncrease = quantity < remaining && quantity < CART_MAX_QTY;
  const canDecrease = quantity > CART_MIN_QTY;
  const discount = product.discountPercentage;
  const was = originalFromDiscount(product.price, discount);
  const reviews = product.reviews ?? [];
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
  const objectIndex = String(product.id).padStart(3, "0");
  const titleWords = product.title.trim().split(/\s+/);
  const accents = [brand, product.tags[0]]
    .filter((v): v is string => Boolean(v))
    .map((v) => v.replace(/[^a-zA-Z]/g, "").toLowerCase());

  useEffect(() => {
    setQuantity(CART_MIN_QTY);
    setAddedFeedback(false);
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
    () => {
      const bar = barRef.current;
      const purchase = purchaseRef.current;

      if (prefersReducedMotion()) return;

      // Act I — the plate wipes up while the copy settles in.
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.fromTo(
        "[data-gallery-stage]",
        { clipPath: "inset(100% 0 0 0)" },
        { clipPath: "inset(0% 0 0 0)", duration: 1.5, ease: "expo.inOut" },
        0,
      )
        .from("[data-study-photo]", { scale: 1.22, duration: 2, ease: "expo.out" }, 0.05)
        .from("[data-hero-word]", { yPercent: 115, duration: 1.15, stagger: 0.05 }, 0.45)
        .from("[data-hero-line]", { y: 28, autoAlpha: 0, duration: 0.95, stagger: 0.07 }, 0.75)
        .from("[data-hero-thumb]", { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.06 }, 0.95)
        .from("[data-hero-ghost]", { autoAlpha: 0, x: 40, duration: 1.4 }, 0.6);

      // Photograph drifts inside its frame as the reader scrolls.
      const photo = root.current?.querySelector("[data-study-photo]");
      if (photo && heroRef.current) {
        gsap.fromTo(
          photo,
          { yPercent: -4 },
          {
            yPercent: 4,
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.4,
            },
          },
        );

        gsap.to("[data-hero-ghost]", {
          xPercent: -18,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      gsap.utils.toArray<HTMLElement>("[data-reveal]", root.current).forEach((el) => {
        gsap.from(el, {
          y: 48,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 86%", once: true },
        });
      });

      // Mobile purchase bar slides in once the inline block has scrolled away.
      if (bar && purchase) {
        gsap.set(bar, { yPercent: 100 });
        ScrollTrigger.create({
          trigger: purchase,
          start: "bottom top+=88",
          onEnter: () => gsap.to(bar, { yPercent: 0, duration: 0.65, ease: "expo.out" }),
          onLeaveBack: () => gsap.to(bar, { yPercent: 100, duration: 0.5, ease: "power3.in" }),
        });
      }
    },
    { scope: root, dependencies: [product.id] },
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

  const purchaseProps = {
    quantity,
    canDecrease,
    canIncrease,
    atCartMax,
    addedFeedback,
    quantityInCart,
    remaining,
    availability,
    inStock,
    stock: product.stock,
    onDecrease: () => setQuantity((q) => clampQuantity(q - 1)),
    onIncrease: () => setQuantity((q) => clampQuantity(Math.min(q + 1, remaining))),
    onAdd,
    onCheckout: openCheckout,
  };

  return (
    <div ref={root} className="min-w-0 pb-24 lg:pb-0">
      {/* ---------- Act I — The plate ---------- */}
      <section
        ref={heroRef}
        className="relative grid grid-cols-1 gap-10 border-t border-fg/15 px-5 pt-6 pb-16 sm:px-8 md:px-10 md:pt-8 md:pb-24 lg:grid-cols-12 lg:gap-x-10 lg:px-14 xl:gap-x-14 xl:px-16"
      >
        {/* On lg, gallery fills a cell sized by the details column (absolute + stretch). */}
        <div className="min-w-0 lg:col-span-7 lg:relative lg:min-h-[22rem]">
          <div className="lg:absolute lg:inset-0">
            <ProductGallery
              key={product.id}
              images={gallery}
              title={product.title}
              objectIndex={objectIndex}
              className="lg:h-full"
            />
          </div>
        </div>

        <div className="relative min-w-0 lg:col-span-5">
          <span
            data-hero-ghost
            aria-hidden
            className="text-outline pointer-events-none absolute -top-6 right-0 z-0 hidden font-display text-[7rem] leading-none font-light opacity-60 select-none sm:block md:text-[9rem] lg:-top-4 lg:text-[8rem] xl:text-[10rem]"
          >
            {objectIndex}
          </span>

          <div className="relative z-10 md:grid md:grid-cols-12 md:gap-x-8 lg:block">
            <div className="md:col-span-7 lg:col-span-full">
              <p data-hero-line className="meta flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-accent">Object N° {objectIndex}</span>
                <span aria-hidden className="size-1 rounded-full bg-fg/25" />
                <span className="capitalize text-fg/45">{formatCategory(product.category)}</span>
              </p>

              <h1 className="mt-7 font-display text-[2.6rem] leading-[1.04] font-light tracking-[-0.01em] break-words sm:text-5xl lg:text-[3.4rem] xl:text-[4rem] 2xl:text-[4.5rem]">
                {titleWords.map((word, i) => (
                  <Fragment key={`${word}-${i}`}>
                    <span className="inline-block max-w-full overflow-hidden pb-[0.14em] -mb-[0.14em] align-top">
                      <span data-hero-word className="inline-block max-w-full break-words will-change-transform">
                        {word}
                      </span>
                    </span>
                    {i < titleWords.length - 1 ? " " : null}
                  </Fragment>
                ))}
              </h1>

              <p
                data-hero-line
                className="font-editorial mt-4 text-xl leading-snug font-light italic text-fg/55 sm:text-2xl"
              >
                {brand ? `by ${brand}` : `from the ${formatCategory(product.category)} shelf`}
              </p>

              <div
                data-hero-line
                className="meta mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-fg/55"
              >
                <span className="inline-flex items-center gap-1.5 text-fg/80">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-3",
                        i < Math.round(product.rating) ? "fill-bronze text-bronze" : "text-fg/20",
                      )}
                      strokeWidth={i < Math.round(product.rating) ? 0 : 1.25}
                    />
                  ))}
                  <span className="ml-1">{product.rating.toFixed(2)}</span>
                </span>
                <span aria-hidden className="size-1 rounded-full bg-fg/25" />
                <span>
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </span>
                {sku ? (
                  <>
                    <span aria-hidden className="size-1 rounded-full bg-fg/25" />
                    <span className="text-fg/40">{sku}</span>
                  </>
                ) : null}
              </div>

              <div data-hero-line className="mt-9 flex flex-wrap items-end gap-x-4 gap-y-2">
                <p className="font-display text-4xl leading-none font-light text-fg lg:text-5xl">
                  {formatMoney(product.price)}
                </p>
                {was ? (
                  <span className="font-display text-xl leading-none font-light text-fg/35 line-through">
                    {formatMoney(was)}
                  </span>
                ) : null}
                {typeof discount === "number" && discount > 0 ? (
                  <span className="meta mb-0.5 border border-accent/40 px-2 py-1 text-accent">
                    −{discount.toFixed(0)}%
                  </span>
                ) : null}
              </div>

              {description ? (
                <p
                  data-hero-line
                  className="mt-8 max-w-md text-[0.95rem] leading-[1.7] break-words text-fg/65"
                >
                  {description}
                </p>
              ) : null}
            </div>

            <div className="mt-10 md:col-span-5 md:mt-0 lg:col-span-full lg:mt-10">
              <div ref={purchaseRef} data-hero-line>
                <PurchaseBlock {...purchaseProps} />
              </div>

              <ul
                data-hero-line
                className="mt-8 grid grid-cols-3 gap-4 border-t border-fg/12 pt-6"
              >
                <Assurance icon={<Truck className="size-3.5" strokeWidth={1.25} />} label="Shipping" body={shipping} />
                <Assurance icon={<RotateCcw className="size-3.5" strokeWidth={1.25} />} label="Returns" body={returns} />
                <Assurance icon={<ShieldCheck className="size-3.5" strokeWidth={1.25} />} label="Warranty" body={warranty} />
              </ul>

              {product.tags.length > 0 ? (
                <div data-hero-line className="mt-8 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="meta border border-fg/12 px-2.5 py-1.5 text-fg/50 transition-colors duration-300 hover:border-fg/40 hover:text-fg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Act II — Material notes ---------- */}
      {description ? (
        <section
          data-reveal
          aria-label="Material notes"
          className="relative border-t border-fg/15 px-5 py-20 sm:px-8 md:px-10 md:py-32 lg:px-14 xl:px-16"
        >
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-14">
            <div className="lg:col-span-3">
              <p className="meta text-fg/45">Material notes</p>
              <dl className="mt-8 space-y-4 border-t border-fg/12 pt-6">
                <MetaRow label="Object">{objectIndex}</MetaRow>
                <MetaRow label="Shelf">
                  <span className="capitalize">{formatCategory(product.category)}</span>
                </MetaRow>
                {brand ? <MetaRow label="Maker">{brand}</MetaRow> : null}
                {typeof product.stock === "number" ? (
                  <MetaRow label="In atelier">{product.stock}</MetaRow>
                ) : null}
              </dl>
            </div>
            <div className="lg:col-span-8 lg:col-start-5">
              <ScrubWords
                text={`“${description}”`}
                accents={accents}
                className="font-display text-[1.75rem] leading-[1.28] font-light tracking-[-0.01em] break-words sm:text-4xl md:text-[2.75rem] lg:text-5xl lg:leading-[1.22]"
              />
              <p className="meta mt-10 text-fg/45">— Notes on {product.title}</p>
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------- Act III — Plates ---------- */}
      <ProductPlates images={gallery} title={product.title} objectIndex={objectIndex} />

      {/* ---------- Act IV — Dossier ---------- */}
      <ProductDossier product={product} />

      {/* ---------- Act V — The collection ---------- */}
      {/* Reveal only the header — wrapping ProductGrid in data-reveal left cards
          stuck at autoAlpha:0 (parent + grid both hide, only the parent restored). */}
      {related.length > 0 ? (
        <section className="border-t border-fg/15 px-5 pt-16 pb-28 sm:px-8 md:px-10 md:pt-24 md:pb-36 lg:px-14 xl:px-16">
          <div
            data-reveal
            className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <p className="meta text-fg/45">The collection</p>
              <h2 className="mt-3 font-display text-3xl leading-[1.05] font-light text-fg md:text-4xl lg:text-5xl">
                More <em className="text-accent">objects.</em>
              </h2>
            </div>
            <Link
              to="/catalogue"
              data-cursor=""
              className="meta group inline-flex items-center gap-2 text-fg/55 transition-colors duration-300 hover:text-accent"
            >
              View the catalogue
              <ArrowUpRight
                className="size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={1.5}
              />
            </Link>
          </div>
          <div className="mt-10 md:mt-14">
            <ProductGrid
              products={related}
              animateKey={`related-${product.id}`}
              className="grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4"
            />
          </div>
        </section>
      ) : null}

      {/* ---------- Mobile / tablet purchase bar ---------- */}
      <div
        ref={barRef}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-fg/15 bg-paper/92 px-5 py-3 backdrop-blur-md sm:px-8 md:px-10 lg:hidden"
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "hidden size-12 shrink-0 overflow-hidden border border-fg/10 sm:block",
              STUDIO_BACKDROP,
            )}
          >
            <img
              src={gallery[0]}
              alt=""
              className="img-tone h-full w-full object-contain p-1 mix-blend-multiply"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base leading-tight font-light">{product.title}</p>
            <p className="meta mt-1 text-fg/55">{formatMoney(product.price)}</p>
          </div>
          <PurchaseBlock compact {...purchaseProps} />
        </div>
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

function Assurance({
  icon,
  label,
  body,
}: {
  icon: ReactNode;
  label: string;
  body: string | null;
}) {
  return (
    <li className="min-w-0">
      <p className="meta inline-flex items-center gap-1.5 text-fg/45">
        <span className="text-fg/60">{icon}</span>
        {label}
      </p>
      <p className="mt-2 text-xs leading-relaxed break-words text-fg/65">{body ?? "—"}</p>
    </li>
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
  onDecrease,
  onIncrease,
  onAdd,
  onCheckout,
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
  onDecrease: () => void;
  onIncrease: () => void;
  onAdd: () => void;
  onCheckout: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const cta = ctaRef.current;
      if (!cta || !contextSafe || prefersReducedMotion() || !isFinePointer()) return;

      const xTo = gsap.quickTo(cta, "x", { duration: 0.6, ease: "power3.out" });
      const yTo = gsap.quickTo(cta, "y", { duration: 0.6, ease: "power3.out" });

      const onMove = contextSafe((e: MouseEvent) => {
        if (cta.disabled) return;
        const rect = cta.getBoundingClientRect();
        xTo((e.clientX - (rect.left + rect.width / 2)) * 0.12);
        yTo((e.clientY - (rect.top + rect.height / 2)) * 0.22);
      });
      const onLeave = contextSafe(() => {
        gsap.to(cta, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.45)", overwrite: "auto" });
      });

      cta.addEventListener("mousemove", onMove);
      cta.addEventListener("mouseleave", onLeave);
      return () => {
        cta.removeEventListener("mousemove", onMove);
        cta.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope: root },
  );

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        "[data-qty]",
        { y: 6, autoAlpha: 0.3 },
        { y: 0, autoAlpha: 1, duration: 0.35, ease: "power3.out", overwrite: "auto" },
      );
    },
    { scope: root, dependencies: [quantity] },
  );

  useGSAP(
    () => {
      if (!addedFeedback || prefersReducedMotion()) return;
      gsap.fromTo(
        "[data-confirm]",
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" },
      );
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { scale: 1 },
          { scale: 1.015, duration: 0.26, yoyo: true, repeat: 1, ease: "power2.inOut" },
        );
      }
    },
    { scope: root, dependencies: [addedFeedback] },
  );

  const stepper = (
    <div
      className={cn(
        "inline-flex items-center justify-between border border-fg/15",
        compact ? "shrink-0" : "w-full sm:w-auto",
      )}
      role="group"
      aria-label="Quantity to add"
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={!canDecrease || atCartMax}
        onClick={onDecrease}
        data-cursor=""
        className={cn(qtyButtonClass(!canDecrease || atCartMax), compact ? "size-11" : "size-12 sm:size-14")}
      >
        <Minus className="size-3" strokeWidth={1.5} />
      </button>
      <span
        className={cn(
          "meta inline-flex justify-center overflow-hidden border-x border-fg/10 text-fg/80",
          compact ? "min-w-9 px-1" : "min-w-12 px-2",
        )}
      >
        <span data-qty className="inline-block">
          {String(quantity).padStart(2, "0")}
        </span>
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={!canIncrease || atCartMax}
        onClick={onIncrease}
        data-cursor=""
        className={cn(qtyButtonClass(!canIncrease || atCartMax), compact ? "size-11" : "size-12 sm:size-14")}
      >
        <Plus className="size-3" strokeWidth={1.5} />
      </button>
    </div>
  );

  const showCheckout = quantityInCart > 0;

  const addCta = (
    <button
      ref={ctaRef}
      type="button"
      onClick={onAdd}
      disabled={atCartMax}
      data-cursor=""
      className={cn(
        "meta group relative inline-flex items-center justify-center overflow-hidden transition-colors duration-500",
        atCartMax
          ? "cursor-not-allowed bg-charcoal/10 text-charcoal/35"
          : "bg-ink text-paper",
        compact ? "min-h-11 shrink-0 px-5" : "min-h-12 w-full flex-1 px-6 sm:min-h-14",
      )}
    >
      {!atCartMax ? (
        <span
          aria-hidden
          className="absolute inset-0 translate-y-full bg-accent transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
        />
      ) : null}
      <span className="relative z-10 inline-flex items-center gap-2">
        {atCartMax ? (
          compact ? "In bag" : `In bag (max ${CART_MAX_QTY})`
        ) : addedFeedback ? (
          <>
            <Check className="size-3.5" strokeWidth={1.5} />
            Added
          </>
        ) : compact ? (
          "Add"
        ) : (
          "Add to Cart"
        )}
      </span>
    </button>
  );

  /** Solid ink CTA — obvious next step once anything is in the bag. */
  const checkoutCta = showCheckout ? (
    <button
      type="button"
      onClick={onCheckout}
      data-cursor=""
      aria-label="Proceed to checkout"
      className={cn(
        "meta inline-flex items-center justify-center bg-ink text-paper transition-colors duration-300 hover:bg-accent",
        compact ? "min-h-11 shrink-0 px-4" : "min-h-12 w-full sm:min-h-14",
      )}
    >
      Checkout
    </button>
  ) : null;

  if (compact) {
    // Sticky bar: once in bag, Checkout is the primary action (In bag is not useful).
    if (atCartMax && checkoutCta) {
      return (
        <div ref={root} className="flex shrink-0 items-center gap-2">
          {checkoutCta}
        </div>
      );
    }
    return (
      <div ref={root} className="flex shrink-0 items-center gap-2">
        {stepper}
        {addCta}
        {checkoutCta}
      </div>
    );
  }

  return (
    <div ref={root} className="border border-fg/15 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        {stepper}
        {addCta}
      </div>

      {checkoutCta ? (
        <div className="mt-3 flex flex-col gap-2">
          {checkoutCta}
          <p className="text-center text-[0.7rem] leading-relaxed text-fg/45">
            {atCartMax
              ? "Bag limit reached — continue to checkout."
              : "Ready when you are — review bag and place order."}
          </p>
        </div>
      ) : null}

      <p className="meta mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-fg/45">
        <span className="inline-flex items-center gap-2">
          <span
            className={cn(
              "size-1.5 rounded-full",
              inStock ? "bg-sage" : "bg-fg/30",
            )}
          />
          {availability ?? (inStock ? "Available" : "Unavailable")}
        </span>
        {typeof stock === "number" ? (
          <>
            <span aria-hidden className="size-1 rounded-full bg-fg/20" />
            <span>{stock} in atelier</span>
          </>
        ) : null}
        <span aria-hidden className="size-1 rounded-full bg-fg/20" />
        <span>Max {CART_MAX_QTY} per order</span>
      </p>

      {addedFeedback ? (
        <p
          data-confirm
          className="mt-4 border border-accent/25 bg-accent/5 px-3.5 py-3 text-xs leading-relaxed text-fg/70"
          role="status"
        >
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
