import { z } from "zod";

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

const ProductsResponseSchema = z.object({
  products: z.array(ProductSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

export type Product = z.infer<typeof ProductSchema>;

const PRODUCTS_URL = "https://dummyjson.com/products?limit=12";

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(PRODUCTS_URL);
  if (!res.ok) {
    throw new Error(`Catalogue unavailable (${res.status})`);
  }

  const json: unknown = await res.json();
  const parsed = ProductsResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error("Catalogue response failed validation");
  }

  return parsed.data.products;
}

export const productsQueryKey = ["products"] as const;
