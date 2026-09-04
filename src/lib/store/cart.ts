import { create } from "zustand";
import { persist } from "zustand/middleware";

export const CART_MIN_QTY = 1;
export const CART_MAX_QTY = 5;
export const CART_TAX_RATE = 0.05;
export const CART_DISCOUNT_RATE = 0.1;
export const CART_DISCOUNT_THRESHOLD = 100;
export const CART_MIN_CHECKOUT = 10;

export interface CartItem {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  category: string;
  quantity: number;
}

export interface CartTotals {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  canCheckout: boolean;
  itemCount: number;
}

export function computeCartTotals(items: CartItem[]): CartTotals {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * CART_TAX_RATE;
  const discount = subtotal > CART_DISCOUNT_THRESHOLD ? subtotal * CART_DISCOUNT_RATE : 0;
  const total = Math.max(0, subtotal + tax - discount);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotal,
    tax,
    discount,
    total,
    canCheckout: subtotal >= CART_MIN_CHECKOUT,
    itemCount,
  };
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: number) => void;
  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;
  clear: () => void;
  getTotals: () => CartTotals;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            if (existing.quantity >= CART_MAX_QTY) {
              return { isOpen: true };
            }
            return {
              isOpen: true,
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: Math.min(CART_MAX_QTY, i.quantity + 1) }
                  : i,
              ),
            };
          }
          return {
            isOpen: true,
            items: [...state.items, { ...item, quantity: CART_MIN_QTY }],
          };
        }),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      increaseQuantity: (id) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && i.quantity < CART_MAX_QTY
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        })),

      decreaseQuantity: (id) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && i.quantity > CART_MIN_QTY
              ? { ...i, quantity: i.quantity - 1 }
              : i,
          ),
        })),

      clear: () => set({ items: [] }),

      getTotals: () => computeCartTotals(get().items),
    }),
    {
      name: "objekt-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
