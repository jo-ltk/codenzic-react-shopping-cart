import { z } from "zod";
import { OBJEKT_PRODUCTS } from "@/lib/data/objekt-products";

const ProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  price: z.number(),
  rating: z.number(),
  thumbnail: z.string(),
  images: z.array(z.string()).min(1),
  brand: z.string().optional(),
  stock: z.number().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

const ProductsSchema = z.array(ProductSchema).min(1);

/**
 * Categories allowed in the OBJEKT shop — lighting, furniture, vessels,
 * textiles and decorative home objects only.
 */
export const RELEVANT_CATEGORIES = new Set([
  "sculptural-lighting",
  "table-lamps",
  "floor-lamps",
  "vessels",
  "tables",
  "chairs",
  "sofas",
  "textiles",
  "decorative-objects",
  "furniture",
  "home-decoration",
]);

export function isRelevantProduct(product: Product): boolean {
  return RELEVANT_CATEGORIES.has(product.category);
}

/**
 * Catalogue inventory for TanStack Query.
 * Serves curated OBJEKT objects (incl. Meridian Floor Lamp) with local
 * sculptural photography — never beauty, apparel, or other off-brand API stock.
 */
export async function fetchProducts(): Promise<Product[]> {
  // Yield so TanStack Query loading state can paint editorial skeletons.
  await Promise.resolve();

  const parsed = ProductsSchema.safeParse(OBJEKT_PRODUCTS);
  if (!parsed.success) {
    throw new Error("Catalogue response failed validation");
  }

  const products = parsed.data.filter(isRelevantProduct);
  if (products.length === 0) {
    throw new Error("No relevant objects in the catalogue");
  }

  return products;
}

export const productsQueryKey = ["products", "objekt-curated"] as const;
