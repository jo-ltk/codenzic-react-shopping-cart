import { useRef, useState, type ReactNode } from "react";
import { Star } from "lucide-react";
import type { Product, ProductReview } from "@/lib/api/products";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface ProductDossierProps {
  product: Product;
}

type Section = {
  id: string;
  number: string;
  title: string;
  body: ReactNode;
};

function formatCategory(category: string) {
  return category.replace(/-/g, " ");
}

function safeText(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
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
 * "Dossier" — the object's paperwork. A sticky index tracks the active
 * chapter as the reader scrolls through details, specification, care, reviews.
 */
export function ProductDossier({ product }: ProductDossierProps) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState("details");

  const description = safeText(product.description);
  const brand = safeText(product.brand);
  const sku = safeText(product.sku);
  const shipping = safeText(product.shippingInformation);
  const returns = safeText(product.returnPolicy);
  const warranty = safeText(product.warrantyInformation);
  const reviews = product.reviews ?? [];
  const dimensions = product.dimensions
    ? `${product.dimensions.width} × ${product.dimensions.height} × ${product.dimensions.depth}`
    : null;

  const sections: Section[] = [
    {
      id: "details",
      number: "01",
      title: "Details",
      body: (
        <div className="max-w-xl">
          <p className="font-display text-xl leading-[1.45] font-light text-fg/80 md:text-2xl">
            {description ?? "No further notes for this object."}
          </p>
          {product.tags.length > 0 ? (
            <div className="mt-8 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="meta border border-fg/12 px-2.5 py-1.5 text-fg/55 transition-colors duration-300 hover:border-fg/40 hover:text-fg"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      id: "specs",
      number: "02",
      title: "Specification",
      body: (
        <dl className="grid max-w-xl grid-cols-1 sm:grid-cols-2 sm:gap-x-10">
          {sku ? <SpecRow label="SKU" value={sku} /> : null}
          <SpecRow label="Category" value={formatCategory(product.category)} capitalize />
          {brand ? <SpecRow label="Brand" value={brand} /> : null}
          {dimensions ? <SpecRow label="Dimensions" value={dimensions} /> : null}
          {typeof product.weight === "number" ? (
            <SpecRow label="Weight" value={String(product.weight)} />
          ) : null}
          {typeof product.stock === "number" ? (
            <SpecRow label="In atelier" value={String(product.stock)} />
          ) : null}
          {typeof product.minimumOrderQuantity === "number" ? (
            <SpecRow label="Min. order" value={String(product.minimumOrderQuantity)} />
          ) : null}
        </dl>
      ),
    },
    {
      id: "care",
      number: "03",
      title: "Shipping & Care",
      body: (
        <div className="grid max-w-2xl gap-8 sm:grid-cols-3 sm:gap-6">
          <Note title="Shipping" body={shipping} />
          <Note title="Returns" body={returns} />
          <Note title="Warranty" body={warranty} />
        </div>
      ),
    },
    {
      id: "reviews",
      number: "04",
      title: "Reviews",
      body: <ReviewsPanel rating={product.rating} reviews={reviews} />,
    },
  ];

  useGSAP(
    () => {
      const panels = gsap.utils.toArray<HTMLElement>("[data-dossier-panel]", root.current);
      panels.forEach((panel) => {
        ScrollTrigger.create({
          trigger: panel,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: (self) => {
            if (self.isActive) setActive(panel.dataset.dossierPanel ?? "details");
          },
        });
      });

      if (prefersReducedMotion()) return;

      panels.forEach((panel) => {
        gsap.from(panel.querySelectorAll("[data-dossier-reveal]"), {
          y: 32,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: panel, start: "top 82%", once: true },
        });
      });

      const bars = gsap.utils.toArray<HTMLElement>("[data-rating-bar]", root.current);
      if (bars.length) {
        gsap.from(bars, {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.1,
          stagger: 0.07,
          ease: "expo.out",
          scrollTrigger: { trigger: bars[0], start: "top 88%", once: true },
        });
      }
    },
    { scope: root, dependencies: [product.id] },
  );

  const jump = (id: string) => {
    root.current
      ?.querySelector<HTMLElement>(`[data-dossier-panel="${id}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      ref={root}
      aria-label="Object dossier"
      className="border-t border-fg/15 px-5 pt-16 pb-8 sm:px-8 md:px-10 md:pt-24 lg:px-14 xl:px-16"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-14">
        {/* Index */}
        <aside className="sticky top-16 z-30 -mx-5 bg-paper/90 px-5 py-3 backdrop-blur-sm sm:-mx-8 sm:px-8 md:-mx-10 md:px-10 lg:static lg:col-span-3 lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
          <div className="lg:sticky lg:top-28">
            <p className="meta hidden text-fg/45 lg:block">Dossier</p>
            <h2 className="mt-3 hidden font-display text-4xl leading-none font-light lg:block xl:text-5xl">
              The paperwork<em className="text-accent">.</em>
            </h2>
            <nav
              aria-label="Dossier chapters"
              className="flex gap-6 overflow-x-auto lg:mt-10 lg:flex-col lg:gap-1 lg:overflow-visible"
            >
              {sections.map((section) => {
                const isActive = active === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    data-cursor=""
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => jump(section.id)}
                    className={cn(
                      "meta group flex shrink-0 items-center gap-3 py-2 text-left transition-colors duration-500",
                      isActive ? "text-fg" : "text-fg/40 hover:text-fg/75",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "hidden h-px transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block",
                        isActive ? "w-8 bg-accent" : "w-3 bg-fg/25 group-hover:w-5",
                      )}
                    />
                    <span className={cn("transition-colors", isActive ? "text-accent" : "text-fg/35")}>
                      {section.number}
                    </span>
                    {section.title}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Chapters */}
        <div className="mt-6 lg:col-span-8 lg:col-start-5 lg:mt-0">
          {sections.map((section) => (
            <article
              key={section.id}
              data-dossier-panel={section.id}
              className="scroll-mt-32 border-t border-fg/12 py-12 first:border-t-0 first:pt-0 md:grid md:grid-cols-12 md:gap-x-8 md:py-16 lg:first:pt-2"
            >
              <header data-dossier-reveal className="md:col-span-4">
                <span className="meta text-accent">{section.number}</span>
                <h3 className="mt-2 font-display text-2xl leading-tight font-light md:text-3xl">
                  {section.title}
                </h3>
              </header>
              <div data-dossier-reveal className="mt-6 min-w-0 md:col-span-8 md:mt-0">
                {section.body}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpecRow({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-fg/10 py-3">
      <dt className="meta text-fg/45">{label}</dt>
      <dd className={cn("text-right text-sm text-fg/80", capitalize && "capitalize")}>{value}</dd>
    </div>
  );
}

function Note({ title, body }: { title: string; body: string | null }) {
  return (
    <div className="border-t border-fg/12 pt-4">
      <p className="meta text-fg/45">{title}</p>
      <p className="mt-3 text-sm leading-relaxed text-fg/70">{body ?? "—"}</p>
    </div>
  );
}

function ReviewsPanel({ rating, reviews }: { rating: number; reviews: ProductReview[] }) {
  const distribution = ratingDistribution(reviews);
  const maxCount = Math.max(1, ...distribution.map((row) => row.count));

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:gap-14">
        <div className="shrink-0">
          <p className="font-display text-6xl leading-none font-light md:text-7xl">
            {rating.toFixed(1)}
          </p>
          <div className="mt-4 inline-flex items-center gap-1">
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
            {reviews.length} {reviews.length === 1 ? "voice" : "voices"}
          </p>
        </div>

        {reviews.length > 0 ? (
          <ul className="min-w-0 flex-1 space-y-2.5 pt-2">
            {distribution.map((row) => (
              <li key={row.star} className="flex items-center gap-3">
                <span className="meta w-4 text-fg/45">{row.star}</span>
                <span className="h-px flex-1 bg-fg/10">
                  <span
                    data-rating-bar
                    className="block h-px bg-bronze/80"
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
        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {reviews.map((review, index) => {
            const date = formatReviewDate(review.date);
            return (
              <li
                key={`${review.reviewerName}-${review.date}-${index}`}
                className="group relative flex flex-col border border-fg/12 p-6 transition-colors duration-500 hover:border-fg/35"
              >
                <span
                  aria-hidden
                  className="font-editorial pointer-events-none absolute top-3 right-5 text-5xl leading-none text-fg/10 transition-colors duration-500 group-hover:text-accent/40"
                >
                  ”
                </span>
                <span className="inline-flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-3",
                        i < Math.round(review.rating) ? "fill-bronze text-bronze" : "text-fg/15",
                      )}
                      strokeWidth={i < Math.round(review.rating) ? 0 : 1.25}
                    />
                  ))}
                </span>
                <p className="mt-5 flex-1 font-display text-lg leading-[1.45] font-light break-words text-fg/85">
                  {review.comment}
                </p>
                <div className="meta mt-6 flex flex-wrap items-center justify-between gap-2 text-fg/45">
                  <span className="text-fg/70">{review.reviewerName}</span>
                  {date ? <span>{date}</span> : null}
                </div>
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
