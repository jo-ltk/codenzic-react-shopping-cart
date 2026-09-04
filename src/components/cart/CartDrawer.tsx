import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { useCartTotals } from "@/hooks/useCartTotals";
import { useCheckoutFlow } from "@/hooks/useCheckoutFlow";
import { useCartStore } from "@/lib/store/cart";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { ShippingForm } from "@/components/checkout/ShippingForm";
import { PaymentSummary } from "@/components/checkout/PaymentSummary";
import { OrderSuccess } from "@/components/checkout/OrderSuccess";

/**
 * Editorial slide-over cart — ivory panel over a soft forest scrim.
 * Zustand owns persisted items + open state; checkout steps live in React state.
 */
export function CartDrawer() {
  const { items, itemCount, canCheckout, ...totals } = useCartTotals();
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const clear = useCartStore((s) => s.clear);
  const checkout = useCheckoutFlow();

  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const scrim = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const summaryTotals = { ...totals, itemCount, canCheckout };

  // Reset checkout when the drawer closes so the next open starts at review.
  useEffect(() => {
    if (!isOpen) checkout.resetCheckout();
  }, [isOpen, checkout.resetCheckout]);

  useEffect(() => {
    const rootEl = root.current;
    const panelEl = panel.current;
    const scrimEl = scrim.current;
    if (!rootEl || !panelEl || !scrimEl) return;

    if (prefersReducedMotion()) {
      rootEl.style.pointerEvents = isOpen ? "auto" : "none";
      rootEl.style.visibility = isOpen ? "visible" : "hidden";
      panelEl.style.transform = isOpen ? "translateX(0)" : "translateX(100%)";
      scrimEl.style.opacity = isOpen ? "1" : "0";
      document.documentElement.style.overflow = isOpen ? "hidden" : "";
      wasOpen.current = isOpen;
      return;
    }

    if (isOpen) {
      rootEl.style.pointerEvents = "auto";
      rootEl.style.visibility = "visible";
      document.documentElement.style.overflow = "hidden";

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(scrimEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }, 0).fromTo(
        panelEl,
        { xPercent: 100 },
        { xPercent: 0, duration: 0.55 },
        0,
      );

      const listItems = panelEl.querySelectorAll<HTMLElement>("[data-cart-item]");
      if (listItems.length) {
        tl.from(
          listItems,
          { y: 14, autoAlpha: 0, duration: 0.35, stagger: 0.05 },
          0.18,
        );
      }

      tl.fromTo(
        panelEl.querySelectorAll("[data-cart-summary]"),
        { y: 10, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.35 },
        0.28,
      );

      wasOpen.current = true;
      return () => {
        tl.kill();
      };
    }

    if (wasOpen.current) {
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => {
          rootEl.style.pointerEvents = "none";
          rootEl.style.visibility = "hidden";
          document.documentElement.style.overflow = "";
        },
      });
      tl.to(panelEl, { xPercent: 100, duration: 0.4 }, 0).to(
        scrimEl,
        { autoAlpha: 0, duration: 0.3 },
        0,
      );
      wasOpen.current = false;
      return () => {
        tl.kill();
      };
    }

    rootEl.style.pointerEvents = "none";
    rootEl.style.visibility = "hidden";
    gsap.set(panelEl, { xPercent: 100 });
    gsap.set(scrimEl, { autoAlpha: 0 });
  }, [isOpen]);

  // Subtle pulse on totals when quantities change while open
  useEffect(() => {
    if (!isOpen || prefersReducedMotion() || checkout.step !== "review") return;
    const targets = panel.current?.querySelectorAll(
      "[data-cart-subtotal], [data-cart-tax], [data-cart-discount], [data-cart-total], [data-cart-line-total], [data-cart-qty]",
    );
    if (!targets?.length) return;
    gsap.fromTo(
      targets,
      { autoAlpha: 0.45 },
      { autoAlpha: 1, duration: 0.28, ease: "power1.out", stagger: 0.02 },
    );
  }, [items, isOpen, checkout.step]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  const handlePlaceOrder = () => {
    const finalTotal = summaryTotals.finalTotal;
    clear();
    checkout.placeOrder(finalTotal);
  };

  const handleSuccessClose = () => {
    checkout.resetCheckout();
    closeCart();
  };

  const title =
    checkout.step === "success"
      ? "Order placed"
      : checkout.step === "shipping"
        ? "Checkout"
        : checkout.step === "payment"
          ? "Checkout"
          : "Your selection";

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[90]"
      style={{ pointerEvents: "none", visibility: "hidden" }}
      aria-hidden={!isOpen}
    >
      <button
        ref={scrim}
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className="absolute inset-0 bg-ink/55"
      />

      <aside
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper text-charcoal shadow-[-24px_0_60px_-40px_rgba(10,22,16,0.45)] sm:max-w-lg"
      >
        <header className="flex items-start justify-between gap-4 border-b border-charcoal/10 px-5 py-5 sm:px-7 sm:py-6">
          <div className="min-w-0">
            <span className="meta text-accent">Bag</span>
            <h2 className="mt-1 font-display text-2xl font-light sm:text-3xl">{title}</h2>
            <div className="mt-3">
              <CheckoutStepper step={checkout.step} />
            </div>
            {checkout.step === "review" ? (
              <p className="meta mt-2 text-charcoal/45">
                {itemCount === 0
                  ? "Empty"
                  : `${itemCount} object${itemCount === 1 ? "" : "s"}`}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Close cart"
            onClick={closeCart}
            data-cursor=""
            className="inline-flex size-10 shrink-0 items-center justify-center border border-charcoal/15 text-charcoal transition-colors duration-300 hover:border-accent hover:text-accent"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-7">
          {checkout.step === "review" ? (
            items.length === 0 ? (
              <div className="py-16 text-center">
                <p className="font-display text-xl font-light text-charcoal/70">
                  Nothing gathered yet.
                </p>
                <button
                  type="button"
                  onClick={closeCart}
                  data-cursor=""
                  className="meta mt-6 inline-flex text-accent"
                >
                  Continue in the catalogue
                </button>
              </div>
            ) : (
              <div>
                {items.map((item) => (
                  <CartLineItem key={item.id} item={item} />
                ))}
                <button
                  type="button"
                  onClick={clear}
                  data-cursor=""
                  className="meta mt-4 mb-2 text-charcoal/40 transition-colors duration-300 hover:text-accent"
                >
                  Clear entire cart
                </button>
              </div>
            )
          ) : null}

          {checkout.step === "shipping" ? (
            <div className="py-6">
              <ShippingForm
                values={checkout.shipping}
                errors={checkout.errors}
                onChange={checkout.updateField}
                onBlur={checkout.blurField}
                onSubmit={checkout.submitShipping}
                onBack={checkout.goToReview}
              />
            </div>
          ) : null}

          {checkout.step === "payment" ? (
            <div className="py-6">
              <PaymentSummary
                totals={summaryTotals}
                shipping={checkout.shipping}
                onBack={checkout.goToShipping}
                onPlaceOrder={handlePlaceOrder}
              />
            </div>
          ) : null}

          {checkout.step === "success" ? (
            <OrderSuccess
              orderTotal={checkout.orderTotal}
              onClose={handleSuccessClose}
            />
          ) : null}
        </div>

        {checkout.step === "review" ? (
          <div className="px-5 pt-2 pb-6 sm:px-7 sm:pb-8">
            <CartSummary
              totals={summaryTotals}
              onCheckout={() => {
                if (!canCheckout) return;
                checkout.startCheckout();
              }}
            />
          </div>
        ) : null}
      </aside>
    </div>
  );
}
