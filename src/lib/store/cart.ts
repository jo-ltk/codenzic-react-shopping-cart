import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CART_MAX_QTY,
  CART_MIN_QTY,
  calculateCartTotals,
  clampQuantity,
  type CartTotals,
} from "@/lib/cart/calculations";

export {
  CART_MIN_QTY,
  CART_MAX_QTY,
  CART_TAX_RATE,
  CART_DISCOUNT_RATE,
  CART_DISCOUNT_THRESHOLD,
  CART_MIN_CHECKOUT,
  calculateCartTotals,
  calcLineTotal,
  clampQuantity,
  formatMoney,
  type CartTotals,
} from "@/lib/cart/calculations";

/** @deprecated Prefer calculateCartTotals — kept as a thin alias. */
export const computeCartTotals = calculateCartTotals;

export interface CartItem {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  category: string;
  quantity: number;
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

function normalizeItems(items: CartItem[]): CartItem[] {
  return items.map((item) => ({
    ...item,
    quantity: clampQuantity(item.quantity),
    price: Number.isFinite(item.price) && item.price >= 0 ? item.price : 0,
  }));
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
                  ? { ...i, quantity: clampQuantity(i.quantity + 1) }
                  : i,
              ),
            };
          }
          return {
            isOpen: true,
            items: [
              ...state.items,
              {
                ...item,
                price: Number.isFinite(item.price) && item.price >= 0 ? item.price : 0,
                quantity: CART_MIN_QTY,
              },
            ],
          };
        }),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      increaseQuantity: (id) =>
        set((state) => ({
          items: state.items.map((i) => {
            if (i.id !== id) return i;
            if (i.quantity >= CART_MAX_QTY) return i;
            return { ...i, quantity: clampQuantity(i.quantity + 1) };
          }),
        })),

      decreaseQuantity: (id) =>
        set((state) => ({
          items: state.items.map((i) => {
            if (i.id !== id) return i;
            if (i.quantity <= CART_MIN_QTY) return i;
            return { ...i, quantity: clampQuantity(i.quantity - 1) };
          }),
        })),

      clear: () => set({ items: [] }),

      getTotals: () => calculateCartTotals(get().items),
    }),
    {
      name: "objekt-cart",
      partialize: (state) => ({ items: state.items }),
      merge: (persisted, current) => {
        const raw = persisted as Partial<CartState> | undefined;
        const items = Array.isArray(raw?.items) ? normalizeItems(raw.items) : [];
        return { ...current, ...raw, items, isOpen: false };
      },
    },
  ),
);
