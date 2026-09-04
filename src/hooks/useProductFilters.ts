import { useCallback, useMemo, useState } from "react";
import type { Product } from "@/lib/api/products";

export type PriceRange = {
  min: number;
  max: number;
};

export type ProductFiltersState = {
  search: string;
  category: string;
  /** Inclusive price bounds; null means unbounded on that side. */
  minPrice: number | null;
  maxPrice: number | null;
};

const INITIAL: ProductFiltersState = {
  search: "",
  category: "all",
  minPrice: null,
  maxPrice: null,
};

function formatCategoryLabel(category: string) {
  return category.replace(/-/g, " ");
}

/**
 * Client-side catalogue filtering. TanStack Query still owns the product list;
 * this hook only derives a filtered view from that data.
 */
export function useProductFilters(products: Product[]) {
  const [search, setSearch] = useState(INITIAL.search);
  const [category, setCategory] = useState(INITIAL.category);
  const [minPrice, setMinPrice] = useState<number | null>(INITIAL.minPrice);
  const [maxPrice, setMaxPrice] = useState<number | null>(INITIAL.maxPrice);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category))).sort((a, b) =>
      a.localeCompare(b),
    );
    return unique.map((value) => ({
      value,
      label: formatCategoryLabel(value),
    }));
  }, [products]);

  const priceBounds = useMemo<PriceRange>(() => {
    if (products.length === 0) return { min: 0, max: 0 };
    let min = products[0].price;
    let max = products[0].price;
    for (const p of products) {
      if (p.price < min) min = p.price;
      if (p.price > max) max = p.price;
    }
    return { min: Math.floor(min), max: Math.ceil(max) };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      if (query && !product.title.toLowerCase().includes(query)) return false;
      if (category !== "all" && product.category !== category) return false;
      if (minPrice !== null && product.price < minPrice) return false;
      if (maxPrice !== null && product.price > maxPrice) return false;
      return true;
    });
  }, [products, search, category, minPrice, maxPrice]);

  const hasActiveFilters =
    search.trim() !== "" ||
    category !== "all" ||
    minPrice !== null ||
    maxPrice !== null;

  const clearAll = useCallback(() => {
    setSearch(INITIAL.search);
    setCategory(INITIAL.category);
    setMinPrice(INITIAL.minPrice);
    setMaxPrice(INITIAL.maxPrice);
  }, []);

  return {
    search,
    setSearch,
    category,
    setCategory,
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
    categories,
    priceBounds,
    filteredProducts,
    resultCount: filteredProducts.length,
    totalCount: products.length,
    hasActiveFilters,
    clearAll,
  };
}

export type UseProductFiltersReturn = ReturnType<typeof useProductFilters>;
