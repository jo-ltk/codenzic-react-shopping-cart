import { useRef, type ReactNode, type MouseEvent } from "react";
import { Link } from "react-router";
import { gsap, isFinePointer } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  /** Client-side route (preferred). Falls back to `href` for legacy call sites. */
  to?: string;
  /** @deprecated Prefer `to` — kept so existing call sites keep working. */
  href?: string;
}

/** CTA that leans toward the cursor and snaps back elastically. */
export function MagneticButton({
  children,
  className,
  to,
  href = "#",
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const destination = to ?? href;

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el || !isFinePointer()) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    gsap.to(el, { x: dx * 0.25, y: dy * 0.35, duration: 0.6, ease: "power3.out" });
  };

  const onLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
  };

  return (
    <Link
      ref={ref}
      to={destination}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-fg/25 px-8 py-4",
        className,
      )}
    >
      {/* accent fill sweeps up on hover */}
      <span className="absolute inset-0 translate-y-full rounded-full bg-accent transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
      <span className="relative z-10 transition-colors duration-500 group-hover:text-paper">
        {children}
      </span>
    </Link>
  );
}
