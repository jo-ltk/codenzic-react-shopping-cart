import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { THEME } from "@/lib/motion";
import {
  categoriesQueryKey,
  fetchCategories,
  fetchProducts,
  productsQueryKey,
  type Product,
} from "@/lib/api/products";
import { useProductFilters } from "@/hooks/useProductFilters";
import { useProductPagination } from "@/hooks/useProductPagination";
import { useCartStore } from "@/lib/store/cart";
import { CatalogueFilters } from "@/components/catalogue/CatalogueFilters";
import { CatalogueToolbar, type CatalogueView } from "@/components/catalogue/CatalogueToolbar";
import { CataloguePagination } from "@/components/catalogue/CataloguePagination";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductSkeleton } from "@/components/products/ProductSkeleton";
import { ProductError } from "@/components/products/ProductError";
import { ProductEmpty } from "@/components/products/ProductEmpty";
import { ProductFilterEmpty } from "@/components/products/ProductFilterEmpty";
import { ProductDetails } from "@/components/products/ProductDetails";
import { Footer } from "@/sections/Footer";

const PAGE_SIZE = 8;

/**
 * Dedicated Product Category / Archive page.
 * Reuses the DummyJSON query + useProductFilters — no second data source.
 */
export function CataloguePage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [view, setView] = useState<CatalogueView>("grid");
  const isCartOpen = useCartStore((s) => s.isOpen);

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: productsQueryKey,
    queryFn: fetchProducts,
  });

  const { data: categoryOptions } = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30,
  });

  const products = data ?? [];
  const filters = useProductFilters(products, { categoryOptions });
  const pagination = useProductPagination(
    filters.filteredProducts,
    PAGE_SIZE,
    filters.filterKey,
  );

  const openDetails = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const closeDetails = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  useEffect(() => {
    if (isCartOpen) setSelectedProduct(null);
  }, [isCartOpen]);

  useEffect(() => {
    document.documentElement.style.setProperty("--bg", THEME.paper.bg);
    document.documentElement.style.setProperty("--fg", THEME.paper.fg);
  }, []);

  const goToPage = (next: number) => {
    pagination.setPage(next);
    document.getElementById("catalogue-archive")?.scrollIntoView({ behavior: "smooth" });
  };

  const showInventory = !isPending && !isError && products.length > 0;
  const showCatalogueEmpty = !isPending && !isError && products.length === 0;
  const showFilterEmpty =
    showInventory && filters.hasActiveFilters && filters.filteredProducts.length === 0;
  const showGrid = showInventory && pagination.pageItems.length > 0;

  return (
    <>
      <main
        id="catalogue-archive"
        data-theme="paper"
        className="relative overflow-x-clip px-5 pt-28 pb-24 sm:pt-32 sm:pb-28 md:px-10 md:pt-36 md:pb-40 lg:px-14"
      >
        <header className="mb-14 flex flex-col gap-10 border-b border-fg/15 pb-12 md:mb-20 md:flex-row md:items-end md:justify-between md:pb-16">
          <div className="max-w-xl">
            <p className="meta text-fg/45">Home / Shop / Objects</p>
            <span className="meta mt-6 block text-fg/50">N°06 — The Catalogue</span>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] font-light md:text-6xl lg:text-7xl">
              Objects,
              <br />
              <em className="text-accent">available now.</em>
            </h1>
            <p className="mt-7 max-w-sm text-sm leading-relaxed text-fg/55">
              A rotating selection from the current issue. Each piece is photographed
              as it arrives — curated for rooms that prefer quiet over noise.
            </p>
          </div>

          <p className="meta text-fg/45 md:text-right">
            {isPending
              ? "Loading inventory…"
              : isError
                ? "Inventory unavailable"
                : `${filters.totalCount} editions found`}
          </p>
        </header>

        {isPending ? (
          <div aria-busy="true" aria-live="polite">
            <p className="meta mb-10 text-fg/45">Preparing the archive…</p>
            <ProductSkeleton
              count={PAGE_SIZE}
              className="grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
            />
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
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12 xl:gap-16">
            <CatalogueFilters filters={filters} />

            <div className="min-w-0 flex-1">
              <CatalogueToolbar
                rangeStart={pagination.rangeStart}
                rangeEnd={pagination.rangeEnd}
                total={pagination.total}
                sort={filters.sort}
                onSortChange={filters.setSort}
                view={view}
                onViewChange={setView}
              />

              {showFilterEmpty ? (
                <ProductFilterEmpty onClear={filters.clearAll} />
              ) : null}

              {showGrid ? (
                <div
                  className={
                    isFetching ? "opacity-90 transition-opacity duration-300" : undefined
                  }
                >
                  <ProductGrid
                    products={pagination.pageItems}
                    indexOffset={(pagination.page - 1) * PAGE_SIZE}
                    animateKey={`${filters.filterKey}|${pagination.page}|${view}`}
                    immediate
                    onOpenDetails={openDetails}
                    className={
                      view === "list"
                        ? "grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1"
                        : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                    }
                  />
                  <CataloguePagination
                    page={pagination.page}
                    pageCount={pagination.pageCount}
                    canPrev={pagination.canPrev}
                    canNext={pagination.canNext}
                    onPageChange={goToPage}
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {selectedProduct ? (
          <ProductDetails product={selectedProduct} onClose={closeDetails} />
        ) : null}
      </main>
      <Footer />
    </>
  );
}
