import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/motion";
import { fetchProducts, productsQueryKey } from "@/lib/api/products";
import { useProductFilters } from "@/hooks/useProductFilters";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductSkeleton } from "@/components/products/ProductSkeleton";
import { ProductError } from "@/components/products/ProductError";
import { ProductEmpty } from "@/components/products/ProductEmpty";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductFilterEmpty } from "@/components/products/ProductFilterEmpty";

/**
 * Product Catalogue — live inventory rendered as an editorial grid.
 * TanStack Query owns fetch/cache; useProductFilters derives the visible list.
 */
export function ProductCatalogue() {
  const root = useRef<HTMLElement>(null);

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: productsQueryKey,
    queryFn: fetchProducts,
  });

  const products = data ?? [];
  const filters = useProductFilters(products);

  useGSAP(
    () => {
      gsap.from("[data-catalogue-intro]", {
        y: 40,
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
      });
    },
    { scope: root },
  );

  const showInventory = !isPending && !isError && products.length > 0;
  const showCatalogueEmpty = !isPending && !isError && products.length === 0;
  const showFilterEmpty =
    showInventory && filters.hasActiveFilters && filters.filteredProducts.length === 0;
  const showGrid = showInventory && filters.filteredProducts.length > 0;

  return (
    <section
      ref={root}
      id="products"
      data-theme="paper"
      className="relative overflow-hidden px-5 py-28 md:px-10 md:py-40 lg:px-14"
    >
      <div
        data-catalogue-intro
        className="mb-16 flex flex-col gap-10 border-b border-fg/15 pb-12 md:mb-24 md:flex-row md:items-end md:justify-between md:pb-16"
      >
        <div className="max-w-xl">
          <span className="meta text-fg/50">N°06 — The Catalogue</span>
          <h2 className="mt-6 font-display text-5xl leading-[1.05] font-light md:text-6xl lg:text-7xl">
            Objects,
            <br />
            <em className="text-accent">available now.</em>
          </h2>
          <p className="mt-7 max-w-sm text-sm leading-relaxed text-fg/55">
            A rotating selection from the current issue. Each piece is photographed
            as it arrives — curated for rooms that prefer quiet over noise.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <span className="meta text-fg/45">
            {isPending
              ? "Loading inventory…"
              : isError
                ? "Inventory unavailable"
                : showInventory
                  ? filters.hasActiveFilters
                    ? `${filters.resultCount} of ${filters.totalCount} objects`
                    : `${filters.totalCount} objects`
                  : `${products.length} objects`}
          </span>
          <a
            href="#catalogue"
            data-cursor=""
            className="meta inline-flex items-center gap-2 text-accent"
          >
            View the Index
            <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
          </a>
        </div>
      </div>

      {isPending ? (
        <div aria-busy="true" aria-live="polite">
          <p className="meta mb-10 text-fg/45">Preparing the catalogue…</p>
          <ProductSkeleton />
        </div>
      ) : null}

      {isError ? (
        <ProductError
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => void refetch()}
        />
      ) : null}

      {showCatalogueEmpty ? <ProductEmpty /> : null}

      {showInventory ? (
        <>
          <ProductFilters filters={filters} />

          {showFilterEmpty ? (
            <ProductFilterEmpty onClear={filters.clearAll} />
          ) : null}

          {showGrid ? (
            <div
              className={isFetching ? "opacity-90 transition-opacity duration-300" : undefined}
            >
              <ProductGrid
                products={filters.filteredProducts}
                animateKey={`${filters.search}|${filters.category}|${filters.minPrice}|${filters.maxPrice}`}
              />
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
