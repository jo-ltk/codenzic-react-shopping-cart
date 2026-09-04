import type { Product } from "@/lib/api/products";

/**
 * Curated OBJEKT catalogue — sculptural lighting, furniture, vessels,
 * textiles and decorative objects that match the editorial world.
 * Ids sit in a high range to avoid colliding with DummyJSON.
 */
export const OBJEKT_PRODUCTS: Product[] = [
  {
    id: 9001,
    title: "Meridian Floor Lamp",
    description:
      "A monumental floor lamp combining hand-carved forest-green marble with ornate bronze detailing. The Meridian features a neoclassical fluted stem and a grand stone dome, casting a warm architectural glow.",
    category: "sculptural-lighting",
    price: 1850,
    rating: 4.9,
    thumbnail: "/products/meridian-floor-lamp.jpg",
    images: ["/products/meridian-floor-lamp.jpg", "/products/lamp.jpg"],
    brand: "OBJEKT",
    stock: 3,
  },
  {
    id: 9002,
    title: "Leone Urn",
    description:
      "Verde marble vessel with bronze lion handles — a quiet sentinel for the mantel or pedestal.",
    category: "vessels",
    price: 1280,
    rating: 4.8,
    thumbnail: "/products/vessel.jpg",
    images: ["/products/vessel.jpg"],
    brand: "OBJEKT",
    stock: 4,
  },
  {
    id: 9003,
    title: "Empire Wing Chair",
    description:
      "Forest velvet wing chair with burnished bronze lion arms and claw feet — built for rooms that outlast seasons.",
    category: "chairs",
    price: 3200,
    rating: 4.9,
    thumbnail: "/products/chair.jpg",
    images: ["/products/chair.jpg"],
    brand: "OBJEKT",
    stock: 2,
  },
  {
    id: 9004,
    title: "Verde Sphere Table",
    description:
      "Veined marble tabletop on a gilt pedestal — a centrepiece that earns familiarity rather than attention.",
    category: "tables",
    price: 4100,
    rating: 4.7,
    thumbnail: "/products/table.jpg",
    images: ["/products/table.jpg"],
    brand: "OBJEKT",
    stock: 2,
  },
  {
    id: 9005,
    title: "Acanthus Throw",
    description:
      "Woven green and gold textile with a fringed edge — soft architecture for the sofa or bed.",
    category: "textiles",
    price: 420,
    rating: 4.6,
    thumbnail: "/products/throw.jpg",
    images: ["/products/throw.jpg"],
    brand: "OBJEKT",
    stock: 12,
  },
  {
    id: 9006,
    title: "Archival Floor Mirror",
    description:
      "Emerald marble frame with a gilt crest — morning light, held in place.",
    category: "decorative-objects",
    price: 5800,
    rating: 4.9,
    thumbnail: "/products/mirror.jpg",
    images: ["/products/mirror.jpg"],
    brand: "OBJEKT",
    stock: 1,
  },
  {
    id: 9007,
    title: "Crescent Sphere Sofa",
    description:
      "Forest velvet sofa with bronze column arms — a crescent form made for evening rooms.",
    category: "sofas",
    price: 7400,
    rating: 4.8,
    thumbnail: "/products/sofa.jpg",
    images: ["/products/sofa.jpg"],
    brand: "OBJEKT",
    stock: 1,
  },
];
