import { useEffect, useRef, useState } from "react";
import { gsap, isFinePointer, prefersReducedMotion } from "@/lib/motion";

const IDLE_SIZE = 11;
const ACTIVE_SIZE = 78;

/**
 * Companion cursor dot. Lerps after the pointer; expands with a label
 * when hovering any element carrying [data-cursor="LABEL"].
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const activeRef = useRef(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!isFinePointer() || prefersReducedMotion()) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;

    document.documentElement.classList.add("has-cursor");
    gsap.set(el, { x: -100, y: -100, width: IDLE_SIZE, height: IDLE_SIZE, opacity: 0.82 });
    gsap.set(labelRef.current, { autoAlpha: 0, scale: 0.72 });

    const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });

    const expand = (label: string) => {
      if (labelRef.current) labelRef.current.textContent = label;
      activeRef.current = true;
      gsap.to(el, {
        width: ACTIVE_SIZE,
        height: ACTIVE_SIZE,
        opacity: 1,
        duration: 0.62,
        ease: "expo.out",
        overwrite: "auto",
      });
      gsap.to(labelRef.current, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.38,
        delay: 0.04,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const contract = () => {
      activeRef.current = false;
      gsap.to(labelRef.current, {
        autoAlpha: 0,
        scale: 0.72,
        duration: 0.22,
        ease: "power2.in",
        overwrite: "auto",
      });
      gsap.to(el, {
        width: IDLE_SIZE,
        height: IDLE_SIZE,
        opacity: 0.82,
        duration: 0.48,
        ease: "power3.inOut",
        overwrite: "auto",
      });
      if (labelRef.current) labelRef.current.textContent = "";
    };

    const resolveTarget = (node: EventTarget | null) => {
      if (!(node instanceof Element)) return null;
      const hit = node.closest<HTMLElement>("[data-cursor]");
      if (!hit) return null;
      // Empty data-cursor keeps the idle dot (nav / non-visual targets).
      const label = hit.dataset.cursor?.trim() ?? "";
      return label ? { hit, label } : null;
    };

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const resolved = resolveTarget(e.target);
      if (resolved) expand(resolved.label);
      else if (activeRef.current) contract();
    };

    const onOut = (e: MouseEvent) => {
      const leaving = resolveTarget(e.target);
      const entering = resolveTarget(e.relatedTarget);
      if (leaving && !entering) contract();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mouseout", onOut, { passive: true });

    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[95] flex size-3 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent will-change-transform"
    >
      <span
        ref={labelRef}
        className="meta pointer-events-none select-none text-[0.55rem] leading-none text-paper"
      />
    </div>
  );
}
