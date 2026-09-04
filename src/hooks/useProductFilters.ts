import { useCallback, useMemo, useState } from "react";
import type { Product } from "@/lib/api/products";

export type PriceRange = {
  min: number;
  max: number;
};

export type ProductSort =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "title-asc"
  | "rating-desc";

export const PRODUCT_SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "title-asc", label: "Title, A–Z" },
  { value: "rating-desc", label: "Rating" },
];

export type FilterOption = {
  value: string;
  label: string;
  count: number;
};

const INITIAL = {
  search: "",
  category: "all",
  minPrice: null as number | null,
  maxPrice: null as number | null,
  material: "all",
  availability: "all",
  sort: "featured" as ProductSort,
};

function formatCategoryLabel(category: string) {
  return category.replace(/-/g, " ");
}

function sortProducts(list: Product[], sort: ProductSort) {
  if (sort === "featured") return list;

  const next = [...list];
  if (sort === "price-asc") next.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") next.sort((a, b) => b.price - a.price);
  else if (sort === "title-asc") next.sort((a, b) => a.title.localeCompare(b.title));
  else if (sort === "rating-desc") next.sort((a, b) => b.rating - a.rating);
  return next;
}

type UseProductFiltersOptions = {
  /** Prefer API category list when available; fall back to product-derived values. */
  categoryOptions?: string[];
};

/**
 * Client-side catalogue filtering. TanStack Query still owns the product list;
 * this hook only derives a filtered view from that data.
 */
export function useProductFilters(
  products: Product[],
  options: UseProductFiltersOptions = {},
) {
  const [search, setSearch] = useState(INITIAL.search);
  const [category, setCategory] = useState(INITIAL.category);
  const [minPrice, setMinPrice] = useState<number | null>(INITIAL.minPrice);
  const [maxPrice, setMaxPrice] = useState<number | null>(INITIAL.maxPrice);
  const [material, setMaterial] = useState(INITIAL.material);
  const [availability, setAvailability] = useState(INITIAL.availability);
  const [sort, setSort] = useState<ProductSort>(INITIAL.sort);

  const categories = useMemo<FilterOption[]>(() => {
    const fromApi = options.categoryOptions?.filter(Boolean) ?? [];
    const unique =
      fromApi.length > 0
        ? Array.from(new Set(fromApi))
        : Array.from(new Set(products.map((p) => p.category)));

    return unique
      .slice()
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({
        value,
        label: formatCategoryLabel(value),
        count: products.filter((p) => p.category === value).length,
      }));
  }, [products, options.categoryOptions]);

  const materials = useMemo<FilterOption[]>(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      for (const tag of product.tags ?? []) {
        const value = tag.trim();
        if (!value) continue;
        counts.set(value, (counts.get(value) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, count]) => ({
        value,
        label: value,
        count,
      }));
  }, [products]);

  const availabilities = useMemo<FilterOption[]>(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      const value = product.availabilityStatus?.trim();
      if (!value) continue;
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, count]) => ({
        value,
        label: value,
        count,
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

    const next = products.filter((product) => {
      if (query && !product.title.toLowerCase().includes(query)) return false;
      if (category !== "all" && product.category !== category) return false;
      if (minPrice !== null && product.price < minPrice) return false;
      if (maxPrice !== null && product.price > maxPrice) return false;
      if (material !== "all" && !(product.tags ?? []).includes(material)) return false;
      if (availability !== "all" && product.availabilityStatus !== availability) {
        return false;
      }
      return true;
    });

    return sortProducts(next, sort);
  }, [products, search, category, minPrice, maxPrice, material, availability, sort]);

  const hasActiveFilters =
    search.trim() !== "" ||
    category !== "all" ||
    minPrice !== null ||
    maxPrice !== null ||
    material !== "all" ||
    availability !== "all";

  const filterKey = `${search}|${category}|${minPrice}|${maxPrice}|${material}|${availability}|${sort}`;

  const clearAll = useCallback(() => {
    setSearch(INITIAL.search);
    setCategory(INITIAL.category);
    setMinPrice(INITIAL.minPrice);
    setMaxPrice(INITIAL.maxPrice);
    setMaterial(INITIAL.material);
    setAvailability(INITIAL.availability);
    setSort(INITIAL.sort);
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
    material,
    setMaterial,
    availability,
    setAvailability,
    sort,
    setSort,
    categories,
    materials,
    availabilities,
    priceBounds,
    filteredProducts,
    resultCount: filteredProducts.length,
    totalCount: products.length,
    hasActiveFilters,
    filterKey,
    clearAll,
  };
}

export type UseProductFiltersReturn = ReturnType<typeof useProductFilters>;
