import { useCallback, useRef, useState } from "react";
import {
  EMPTY_SHIPPING,
  validateShipping,
  type ShippingErrors,
  type ShippingField,
  type ShippingFormData,
} from "@/lib/checkout/shippingSchema";
import type { CheckoutStep } from "@/components/checkout/CheckoutStepper";

function createOrderReference() {
  const stamp = Date.now().toString(36).toUpperCase();
  const noise = Math.floor(Math.random() * 900 + 100);
  return `OBJ-${stamp}-${noise}`;
}

export function useCheckoutFlow() {
  const [step, setStep] = useState<CheckoutStep>("review");
  const [shipping, setShipping] = useState<ShippingFormData>(EMPTY_SHIPPING);
  const [errors, setErrors] = useState<ShippingErrors>({});
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderReference, setOrderReference] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const placingLock = useRef(false);

  const resetCheckout = useCallback(() => {
    placingLock.current = false;
    setIsPlacingOrder(false);
    setStep("review");
    setShipping(EMPTY_SHIPPING);
    setErrors({});
    setOrderTotal(0);
    setOrderReference("");
  }, []);

  const startCheckout = useCallback(() => {
    setStep("shipping");
    setErrors({});
  }, []);

  /** Guarded entry — only leave review when the bag can check out. */
  const beginCheckout = useCallback((canProceed: boolean) => {
    if (!canProceed) return false;
    setStep("shipping");
    setErrors({});
    return true;
  }, []);

  const goToReview = useCallback(() => {
    setStep("review");
  }, []);

  const goToShipping = useCallback(() => {
    setStep("shipping");
  }, []);

  const updateField = useCallback((field: ShippingField, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const blurField = useCallback((field: ShippingField) => {
    setShipping((prev) => {
      const fieldError = validateShipping(prev, field);
      setErrors((errs) => {
        const next = { ...errs };
        if (fieldError[field]) next[field] = fieldError[field];
        else delete next[field];
        return next;
      });
      return prev;
    });
  }, []);

  const submitShipping = useCallback(() => {
    const nextErrors = validateShipping(shipping);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return false;
    setStep("payment");
    return true;
  }, [shipping]);

  /**
   * Complete the order once. Locks against double-clicks, stores total +
   * reference in React state so the success screen survives cart.clear().
   */
  const placeOrder = useCallback((finalTotal: number) => {
    if (placingLock.current || isPlacingOrder) return false;

    placingLock.current = true;
    setIsPlacingOrder(true);

    const reference = createOrderReference();
    setOrderTotal(finalTotal);
    setOrderReference(reference);
    setStep("success");
    setIsPlacingOrder(false);

    return true;
  }, [isPlacingOrder]);

  return {
    step,
    shipping,
    errors,
    orderTotal,
    orderReference,
    isPlacingOrder,
    resetCheckout,
    startCheckout,
    beginCheckout,
    goToReview,
    goToShipping,
    updateField,
    blurField,
    submitShipping,
    placeOrder,
  };
}
