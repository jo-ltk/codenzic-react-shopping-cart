import { useMemo } from "react";
import {
  calcLineTotal,
  calculateCartTotals,
  type CartTotals,
} from "@/lib/cart/calculations";
import { useCartStore, type CartItem } from "@/lib/store/cart";

/**
 * Derive live cart totals from Zustand items.
 * Recalculates whenever the cart list or any quantity changes.
 */
export function useCartTotals(): CartTotals & { items: CartItem[] } {
  const items = useCartStore((s) => s.items);

  const totals = useMemo(() => calculateCartTotals(items), [items]);

  return { ...totals, items };
}

/** Line total for a single item — shared with the calculation utility. */
export function useCartLineTotal(price: number, quantity: number): number {
  return useMemo(() => calcLineTotal(price, quantity), [price, quantity]);
}
