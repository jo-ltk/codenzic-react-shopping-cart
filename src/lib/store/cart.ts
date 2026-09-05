import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  CART_MAX_QTY,
  CART_MIN_QTY,
  calculateCartTotals,
  clampQuantity,
  type CartTotals,
} from "@/lib/cart/calculations";
import {
  CART_STORAGE_KEY,
  createCartStorage,
  normalizePersistedCart,
  type CartItem,
} from "@/lib/store/cartPersist";

export type { CartItem };

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

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  /** When true, CartDrawer should attempt beginCheckout after opening. */
  checkoutIntent: boolean;
  hasHydrated: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  /** Open the cart and request entry into the existing checkout flow. */
  openCheckout: () => void;
  consumeCheckoutIntent: () => void;
  addItem: (
    item: Omit<CartItem, "quantity">,
    options?: number | { quantity?: number; openCart?: boolean },
  ) => void;
  removeItem: (id: number) => void;
  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;
  clear: () => void;
  getTotals: () => CartTotals;
  setHasHydrated: (value: boolean) => void;
}

/**
 * OBJEKT cart store.
 * Product lists stay in TanStack Query — Zustand only holds bag lines.
 * `persist` writes `items` to localStorage under CART_STORAGE_KEY.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      checkoutIntent: false,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      openCart: () => set({ isOpen: true, checkoutIntent: false }),
      closeCart: () => set({ isOpen: false, checkoutIntent: false }),
      toggleCart: () =>
        set((state) => ({
          isOpen: !state.isOpen,
          checkoutIntent: false,
        })),
      openCheckout: () => set({ isOpen: true, checkoutIntent: true }),
      consumeCheckoutIntent: () => set({ checkoutIntent: false }),

      addItem: (item, options) =>
        set((state) => {
          const opts =
            typeof options === "number"
              ? { quantity: options, openCart: true }
              : {
                  quantity: options?.quantity ?? CART_MIN_QTY,
                  openCart: options?.openCart ?? true,
                };
          const addQty = clampQuantity(opts.quantity ?? CART_MIN_QTY);
          const openCart = opts.openCart !== false;
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            if (existing.quantity >= CART_MAX_QTY) {
              return openCart ? { isOpen: true } : {};
            }
            return {
              ...(openCart ? { isOpen: true } : {}),
              items: state.items.map((i) =>
                i.id === item.id
                  ? {
                      ...i,
                      quantity: clampQuantity(i.quantity + addQty),
                    }
                  : i,
              ),
            };
          }
          return {
            ...(openCart ? { isOpen: true } : {}),
            items: [
              ...state.items,
              {
                id: item.id,
                title: item.title,
                thumbnail: item.thumbnail,
                category: item.category,
                price: Number.isFinite(item.price) && item.price >= 0 ? item.price : 0,
                quantity: addQty,
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

      /** Empties the bag — persist middleware writes [] to localStorage. */
      clear: () => set({ items: [] }),

      getTotals: () => calculateCartTotals(get().items),
    }),
    {
      name: CART_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(createCartStorage),
      // Only cart lines are persisted — UI flags stay ephemeral.
      partialize: (state) => ({ items: state.items }),
      merge: (persisted, current) => {
        try {
          const raw = persisted as { items?: unknown } | null | undefined;
          const items = normalizePersistedCart(raw?.items);
          return {
            ...current,
            items,
            isOpen: false,
            checkoutIntent: false,
          };
        } catch {
          // Corrupt payload → start empty rather than crash.
          return {
            ...current,
            items: [],
            isOpen: false,
            checkoutIntent: false,
          };
        }
      },
      migrate: (persisted) => {
        // Future schema bumps can transform here; v1 is a pass-through.
        return persisted as CartState;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          // Failed rehydrate — keep an empty cart and mark ready.
          useCartStore.setState({
            items: [],
            hasHydrated: true,
            isOpen: false,
            checkoutIntent: false,
          });
          return;
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);
