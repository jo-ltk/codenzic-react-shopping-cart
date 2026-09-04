import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  /** seconds for one full loop */
  duration?: number;
}

/** Infinite horizontal ticker. Content is duplicated for a seamless loop. */
export function Marquee({ children, className, duration = 28 }: MarqueeProps) {
  return (
    <div className={cn("overflow-hidden whitespace-nowrap", className)}>
      <div
        className="marquee-track inline-flex w-max items-center"
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        <div className="flex items-center">{children}</div>
        <div className="flex items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
