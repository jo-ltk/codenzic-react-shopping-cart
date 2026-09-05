import { cn } from "@/lib/utils";

export type CheckoutStep = "review" | "shipping" | "payment" | "success";

const STEPS: { id: Exclude<CheckoutStep, "success">; label: string }[] = [
  { id: "review", label: "Cart" },
  { id: "shipping", label: "Shipping" },
  { id: "payment", label: "Payment" },
];

interface CheckoutStepperProps {
  step: CheckoutStep;
}

export function CheckoutStepper({ step }: CheckoutStepperProps) {
  const activeIndex = STEPS.findIndex((s) => s.id === step);

  if (step === "success") {
    return <p className="meta text-accent">Order confirmed</p>;
  }

  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1.5 sm:gap-x-3">
      {STEPS.map((s, index) => {
        const isActive = s.id === step;
        const isDone = activeIndex >= 0 && index < activeIndex;
        return (
          <li key={s.id} className="meta flex items-center gap-2 sm:gap-3">
            {index > 0 ? (
              <span aria-hidden className="text-charcoal/20">
                /
              </span>
            ) : null}
            <span
              className={cn(
                "tracking-[0.14em]",
                isActive ? "text-accent" : isDone ? "text-charcoal/70" : "text-charcoal/35",
              )}
            >
              <span className="hidden sm:inline">
                {String(index + 1).padStart(2, "0")} —{" "}
              </span>
              <span className="sm:hidden">{index + 1}.</span> {s.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
