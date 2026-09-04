import { cn } from "@/lib/utils";

export type CheckoutStep = "review" | "shipping" | "payment" | "success";

const STEPS: { id: CheckoutStep; label: string }[] = [
  { id: "review", label: "Review" },
  { id: "shipping", label: "Shipping" },
  { id: "payment", label: "Payment" },
  { id: "success", label: "Order" },
];

interface CheckoutStepperProps {
  step: CheckoutStep;
}

export function CheckoutStepper({ step }: CheckoutStepperProps) {
  const activeIndex = STEPS.findIndex((s) => s.id === step);

  if (step === "success") {
    return (
      <p className="meta text-accent">Order confirmed</p>
    );
  }

  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-2">
      {STEPS.filter((s) => s.id !== "success").map((s, index) => {
        const isActive = s.id === step;
        const isDone = index < activeIndex;
        return (
          <li key={s.id} className="meta flex items-center gap-3">
            <span
              className={cn(
                isActive ? "text-accent" : isDone ? "text-charcoal/70" : "text-charcoal/35",
              )}
            >
              {String(index + 1).padStart(2, "0")} — {s.label}
            </span>
            {index < STEPS.length - 2 ? (
              <span aria-hidden className="text-charcoal/20">
                /
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
