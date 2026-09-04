import type { ReactNode } from "react";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";

interface EditorialStateProps {
  eyebrow: string;
  title: ReactNode;
  body: ReactNode;
  accent?: boolean;
  action?: ReactNode;
  className?: string;
  /** Use charcoal palette when rendered inside the ivory cart drawer. */
  onPaper?: boolean;
}

/** Shared loading/error/empty/success frame for catalogue + cart states. */
export function EditorialState({
  eyebrow,
  title,
  body,
  accent = false,
  action,
  className,
  onPaper = false,
}: EditorialStateProps) {
  return (
    <div
      className={cn(
        ui.statePanel,
        onPaper && "border-charcoal/15 text-charcoal",
        className,
      )}
    >
      <span className={cn("meta", accent ? "text-accent" : onPaper ? "text-charcoal/45" : "text-fg/50")}>
        {eyebrow}
      </span>
      <p
        className={cn(
          "mt-5 font-display text-2xl leading-snug font-light md:text-3xl",
          onPaper ? "text-charcoal" : "text-fg",
        )}
      >
        {title}
      </p>
      <div
        className={cn(
          "mt-4 text-sm leading-relaxed",
          onPaper ? "text-charcoal/55" : "text-fg/55",
        )}
      >
        {body}
      </div>
      {action ? <div className="mt-10">{action}</div> : null}
    </div>
  );
}
