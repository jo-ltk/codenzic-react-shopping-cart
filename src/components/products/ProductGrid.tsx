import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";
import type { Product } from "@/lib/api/products";
import { ProductCard } from "@/components/products/ProductCard";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  /** Changes when filters update so entrance motion can re-run gently. */
  animateKey?: string;
  onOpenDetails?: (product: Product) => void;
  className?: string;
  /** Offset for editorial index numbers across paginated pages. */
  indexOffset?: number;
  /** Skip scroll trigger — used when the grid is already in view. */
  immediate?: boolean;
}

export function ProductGrid({
  products,
  animateKey = "all",
  onOpenDetails,
  className,
  indexOffset = 0,
  immediate = false,
}: ProductGridProps) {
  const root = useRef<HTMLDivElement>(null);
  const hasEntered = useRef(false);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-product-card]", root.current);
      if (!cards.length) return;

      if (!hasEntered.current) {
        gsap.from(cards, {
          y: 36,
          autoAlpha: 0,
          duration: 0.7,
          stagger: 0.06,
          ease: "power3.out",
          ...(immediate
            ? {}
            : {
                scrollTrigger: {
                  trigger: root.current,
                  start: "top 82%",
                  once: true,
                },
              }),
          onComplete: () => {
            hasEntered.current = true;
          },
        });
        return;
      }

      gsap.fromTo(
        cards,
        { y: 16, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.4,
          stagger: 0.04,
          ease: "power2.out",
          overwrite: "auto",
        },
      );
    },
    { scope: root, dependencies: [products, animateKey] },
  );

  return (
    <div
      ref={root}
      className={cn(
        "grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-20 xl:grid-cols-4",
        className,
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={indexOffset + index}
          onOpenDetails={onOpenDetails}
        />
      ))}
    </div>
  );
}
