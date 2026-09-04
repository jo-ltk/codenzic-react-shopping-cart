import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  title: string;
  className?: string;
}

function padFrame(index: number, total: number) {
  const current = String(index + 1).padStart(2, "0");
  const count = String(Math.max(total, 1)).padStart(2, "0");
  return `${current} / ${count}`;
}

/**
 * Editorial object photography — crossfade gallery, thumbnails, and a quiet zoom.
 */
export function ProductGallery({ images, title, className }: ProductGalleryProps) {
  const root = useRef<HTMLDivElement>(null);
  const ready = useRef(false);
  const [index, setIndex] = useState(0);
  const total = images.length;
  const canNavigate = total > 1;

  useEffect(() => {
    setIndex(0);
  }, [images]);

  useGSAP(
    () => {
      const nodes = gsap.utils.toArray<HTMLElement>("[data-gallery-frame]", root.current);
      if (!nodes.length) return;
      const duration = !ready.current || prefersReducedMotion() ? 0 : 0.75;
      ready.current = true;
      nodes.forEach((node, i) => {
        gsap.to(node, {
          autoAlpha: i === index ? 1 : 0,
          duration,
          ease: "power3.inOut",
          overwrite: "auto",
        });
      });
    },
    { scope: root, dependencies: [index, images] },
  );

  const goTo = (next: number) => {
    if (!canNavigate) return;
    setIndex((next + total) % total);
  };

  return (
    <div
      ref={root}
      className={cn("relative flex h-full min-h-0 flex-col", className)}
      aria-roledescription="carousel"
      aria-label={`${title} photography`}
    >
      <div className="group relative min-h-0 flex-1 overflow-hidden bg-fg/[0.03]">
        <div className="relative aspect-[3/4] h-full w-full overflow-hidden lg:absolute lg:inset-0 lg:aspect-auto">
          <div data-study-photo className="absolute inset-0">
            <div className="absolute inset-0 will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]">
            {images.map((src, i) => (
              <img
                key={src}
                data-gallery-frame
                src={src}
                alt={i === index ? title : ""}
                className="img-tone absolute inset-0 h-full w-full object-cover"
                style={{ opacity: i === 0 ? 1 : 0 }}
              />
            ))}
            </div>
          </div>
        </div>

        <span className="meta pointer-events-none absolute top-5 left-5 z-20 text-paper/85 mix-blend-difference sm:top-6 sm:left-6">
          Object study
        </span>

        <span className="meta pointer-events-none absolute top-5 right-5 z-20 text-paper/85 mix-blend-difference sm:top-6 sm:right-6">
          {padFrame(index, total)}
        </span>

        {canNavigate ? (
          <>
            <button
              type="button"
              data-cursor=""
              aria-label="Previous image"
              onClick={() => goTo(index - 1)}
              className="absolute top-1/2 left-3 z-20 flex size-10 -translate-y-1/2 items-center justify-center border border-paper/25 bg-ink/35 text-paper backdrop-blur-sm transition-colors duration-500 hover:border-accent hover:text-accent sm:left-5"
            >
              <ChevronLeft className="size-4" strokeWidth={1.25} />
            </button>
            <button
              type="button"
              data-cursor=""
              aria-label="Next image"
              onClick={() => goTo(index + 1)}
              className="absolute top-1/2 right-3 z-20 flex size-10 -translate-y-1/2 items-center justify-center border border-paper/25 bg-ink/35 text-paper backdrop-blur-sm transition-colors duration-500 hover:border-accent hover:text-accent sm:right-5"
            >
              <ChevronRight className="size-4" strokeWidth={1.25} />
            </button>
          </>
        ) : null}

        {canNavigate ? (
          <div className="absolute inset-x-0 bottom-0 z-20 hidden gap-2 bg-gradient-to-t from-ink/60 to-transparent px-5 pt-16 pb-5 lg:flex">
            {images.map((src, i) => (
              <Thumb
                key={src}
                src={src}
                selected={i === index}
                onSelect={() => goTo(i)}
                label={`View image ${i + 1}`}
                overlay
              />
            ))}
          </div>
        ) : null}
      </div>

      {canNavigate ? (
        <div className="flex gap-2 overflow-x-auto overscroll-x-contain border-t border-fg/10 p-3 sm:p-4 lg:hidden">
          {images.map((src, i) => (
            <Thumb
              key={src}
              src={src}
              selected={i === index}
              onSelect={() => goTo(i)}
              label={`View image ${i + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Thumb({
  src,
  selected,
  onSelect,
  label,
  overlay = false,
}: {
  src: string;
  selected: boolean;
  onSelect: () => void;
  label: string;
  overlay?: boolean;
}) {
  return (
    <button
      type="button"
      data-cursor=""
      aria-label={label}
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "shrink-0 overflow-hidden border transition-[border-color,opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        selected ? "border-accent opacity-100" : "scale-[0.97] opacity-70 hover:opacity-100",
        selected
          ? ""
          : overlay
            ? "border-paper/30 hover:border-paper/60"
            : "border-fg/15 hover:border-fg/40",
      )}
    >
      <img src={src} alt="" className="img-tone size-14 object-cover sm:size-16" />
    </button>
  );
}
