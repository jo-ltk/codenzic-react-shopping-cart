import { cn } from "@/lib/utils";

/** Shared editorial control styles — keeps cart, checkout, and catalogue aligned. */
export const ui = {
  field:
    "w-full border border-current/15 bg-transparent px-3.5 py-2.5 text-sm outline-none transition-colors duration-300 placeholder:opacity-35 focus:border-accent/60",
  fieldOnPaper:
    "w-full border border-charcoal/15 bg-transparent px-3.5 py-2.5 text-sm text-charcoal outline-none transition-colors duration-300 placeholder:text-charcoal/30 focus:border-accent/60",
  fieldOnTheme:
    "w-full border border-fg/15 bg-transparent px-3.5 py-2.5 text-sm text-fg outline-none transition-colors duration-300 placeholder:text-fg/35 focus:border-accent/60",
  label: "meta mb-2 block opacity-45",
  btnPrimary:
    "meta inline-flex min-h-11 items-center justify-center bg-ink px-4 py-3 text-paper transition-colors duration-300 hover:bg-accent disabled:cursor-not-allowed disabled:bg-charcoal/15 disabled:text-charcoal/35",
  btnPrimaryFull:
    "meta inline-flex min-h-12 w-full items-center justify-center bg-ink px-4 py-3.5 text-paper transition-colors duration-300 hover:bg-accent disabled:cursor-not-allowed disabled:bg-charcoal/15 disabled:text-charcoal/35 disabled:shadow-none",
  btnGhost:
    "meta inline-flex min-h-11 items-center justify-center border border-charcoal/15 px-4 py-3 text-charcoal transition-colors duration-300 hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40",
  btnGhostTheme:
    "meta inline-flex min-h-11 items-center justify-center border border-fg/25 px-7 py-3.5 text-fg transition-colors duration-500 hover:border-accent hover:text-accent",
  statePanel:
    "mx-auto w-full max-w-md border border-fg/15 px-8 py-16 text-center md:px-12 md:py-20",
  notice:
    "mt-4 border border-accent/25 bg-accent/5 px-3.5 py-3 text-xs leading-relaxed text-charcoal/70",
  qtyBtn:
    "inline-flex size-9 items-center justify-center text-charcoal transition-colors duration-300",
  qtyBtnDisabled: "cursor-not-allowed text-charcoal/25",
  qtyBtnActive: "hover:bg-charcoal/5 hover:text-accent",
} as const;

export function qtyButtonClass(disabled: boolean) {
  return cn(ui.qtyBtn, disabled ? ui.qtyBtnDisabled : ui.qtyBtnActive);
}
