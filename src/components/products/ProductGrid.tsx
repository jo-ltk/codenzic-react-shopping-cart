import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";
import type { Product } from "@/lib/api/products";
import { ProductCard } from "@/components/products/ProductCard";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-product-card]", root.current);
      if (!cards.length) return;

      gsap.from(cards, {
        y: 36,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.06,
        ease: "power3.out",
        scrollTrigger: {
          trigger: root.current,
          start: "top 82%",
          once: true,
        },
      });
    },
    { scope: root, dependencies: [products] },
  );

  return (
    <div
      ref={root}
      className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-x-8 lg:gap-y-20"
    >
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}
