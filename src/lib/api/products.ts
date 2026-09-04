import { z } from "zod";

const API_BASE = "https://dummyjson.com";

const ReviewSchema = z.object({
  rating: z.number(),
  comment: z.string(),
  date: z.string(),
  reviewerName: z.string(),
  reviewerEmail: z.string().optional(),
});

const DimensionsSchema = z.object({
  width: z.number(),
  height: z.number(),
  depth: z.number(),
});

/**
 * DummyJSON product shape — optional fields stay optional so partial
 * payloads still parse instead of rejecting the whole catalogue.
 */
const ProductSchema = z
  .object({
    id: z.number(),
    title: z.string().min(1),
    description: z.string().optional().default(""),
    category: z.string().min(1),
    price: z.number(),
    discountPercentage: z.number().optional(),
    rating: z.number().optional().default(0),
    stock: z.number().optional(),
    tags: z.array(z.string()).optional().default([]),
    sku: z.string().optional(),
    weight: z.number().optional(),
    dimensions: DimensionsSchema.optional(),
    warrantyInformation: z.string().optional(),
    shippingInformation: z.string().optional(),
    availabilityStatus: z.string().optional(),
    reviews: z.array(ReviewSchema).optional().default([]),
    returnPolicy: z.string().optional(),
    minimumOrderQuantity: z.number().optional(),
    brand: z.string().optional(),
    thumbnail: z.string().optional().default(""),
    images: z.array(z.string()).optional().default([]),
  })
  .transform((product) => {
    const thumbnail =
      product.thumbnail ||
      product.images.find((src) => Boolean(src?.trim())) ||
      "";
    const images = (product.images.length > 0 ? product.images : [thumbnail]).filter(
      (src) => Boolean(src?.trim()),
    );

    return {
      ...product,
      thumbnail,
      images,
    };
  })
  .refine((product) => product.images.length > 0 && Boolean(product.thumbnail), {
    message: "Product requires at least one image",
  });

export type Product = z.infer<typeof ProductSchema>;
export type ProductReview = z.infer<typeof ReviewSchema>;

const ProductsResponseSchema = z.object({
  products: z.array(z.unknown()),
  total: z.number().optional(),
  skip: z.number().optional(),
  limit: z.number().optional(),
});

const CategoryListSchema = z.array(z.string().min(1));

function parseProducts(raw: unknown[]): Product[] {
  const products: Product[] = [];

  for (const entry of raw) {
    const parsed = ProductSchema.safeParse(entry);
    if (parsed.success) {
      products.push(parsed.data);
    }
  }

  return products;
}

/**
 * Fetch the live DummyJSON catalogue.
 * Validates each product with Zod and skips malformed rows.
 */
export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE}/products?limit=0`);

  if (!response.ok) {
    throw new Error(`Catalogue request failed (${response.status})`);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new Error("Catalogue response was not valid JSON");
  }

  const envelope = ProductsResponseSchema.safeParse(json);
  if (!envelope.success) {
    throw new Error("Catalogue response failed validation");
  }

  if (envelope.data.products.length === 0) {
    return [];
  }

  const products = parseProducts(envelope.data.products);
  if (products.length === 0) {
    throw new Error("No valid products in the catalogue response");
  }

  return products;
}

export class ProductNotFoundError extends Error {
  constructor(id: number) {
    super(`Object ${id} was not found in the catalogue.`);
    this.name = "ProductNotFoundError";
  }
}

/**
 * Fetch a single DummyJSON product by id and validate with the same Zod schema.
 */
export async function fetchProductById(id: number): Promise<Product> {
  const response = await fetch(`${API_BASE}/products/${id}`);

  if (response.status === 404) {
    throw new ProductNotFoundError(id);
  }

  if (!response.ok) {
    throw new Error(`Product request failed (${response.status})`);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new Error("Product response was not valid JSON");
  }

  const parsed = ProductSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Product response failed validation");
  }

  return parsed.data;
}

/**
 * All DummyJSON category slugs — used for the category filter
 * so options are not hardcoded and stay in sync with the API.
 */
export async function fetchCategories(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/products/category-list`);

  if (!response.ok) {
    throw new Error(`Category list request failed (${response.status})`);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new Error("Category list was not valid JSON");
  }

  const parsed = CategoryListSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Category list failed validation");
  }

  return [...parsed.data].sort((a, b) => a.localeCompare(b));
}

export const productsQueryKey = ["products", "dummyjson"] as const;
export const categoriesQueryKey = ["products", "categories", "dummyjson"] as const;
export const productQueryKey = (id: number) => ["products", "dummyjson", id] as const;
