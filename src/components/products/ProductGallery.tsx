import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  title: string;
  /** Editorial object index printed on the plate label (e.g. "001"). */
  objectIndex?: string;
  className?: string;
}

/** Warm studio backdrop — product cutouts read as photographed on ivory paper. */
export const STUDIO_BACKDROP =
  "bg-[radial-gradient(120%_90%_at_50%_32%,#f7f2e9_0%,#ede6d9_52%,#dcd3c3_100%)]";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Cinematic object photography — directional crossfade, vertical filmstrip,
 * rolling frame counter, and a paper lightbox. Multiply blending drops
 * white product backgrounds into the studio backdrop.
 */
export function ProductGallery({
  images,
  title,
  objectIndex = "001",
  className,
}: ProductGalleryProps) {
  const root = useRef<HTMLDivElement>(null);
  const ready = useRef(false);
  const direction = useRef(1);
  const [current, setCurrent] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const total = images.length;
  const canNavigate = total > 1;

  useEffect(() => {
    setCurrent(0);
    ready.current = false;
  }, [images]);

  const goTo = useCallback(
    (next: number) => {
      if (!canNavigate) return;
      const target = (next + total) % total;
      direction.current = target >= current ? 1 : -1;
      if (current === total - 1 && target === 0) direction.current = 1;
      if (current === 0 && target === total - 1) direction.current = -1;
      setCurrent(target);
    },
    [canNavigate, current, total],
  );

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomed(false);
      if (e.key === "ArrowRight") goTo(current + 1);
      if (e.key === "ArrowLeft") goTo(current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed, current, goTo]);

  useGSAP(
    () => {
      const frames = gsap.utils.toArray<HTMLElement>("[data-gallery-frame]", root.current);
      if (!frames.length) return;
      const instant = !ready.current || prefersReducedMotion();
      ready.current = true;

      frames.forEach((frame, i) => {
        const active = i === current;
        if (instant) {
          gsap.set(frame, { autoAlpha: active ? 1 : 0, scale: 1, xPercent: 0 });
          return;
        }
        if (active) {
          gsap.fromTo(
            frame,
            { autoAlpha: 0, scale: 1.08, xPercent: 5 * direction.current },
            {
              autoAlpha: 1,
              scale: 1,
              xPercent: 0,
              duration: 1,
              ease: "expo.out",
              overwrite: "auto",
            },
          );
        } else {
          gsap.to(frame, {
            autoAlpha: 0,
            scale: 1.02,
            xPercent: -3 * direction.current,
            duration: 0.55,
            ease: "power2.inOut",
            overwrite: "auto",
          });
        }
      });

      if (!instant) {
        gsap.fromTo(
          "[data-gallery-counter]",
          { yPercent: 70, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out", overwrite: "auto" },
        );
      }
    },
    { scope: root, dependencies: [current, images] },
  );

  useGSAP(
    () => {
      const box = root.current?.querySelector("[data-gallery-lightbox]");
      if (!box || !zoomed || prefersReducedMotion()) return;
      gsap.fromTo(box, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "power2.out" });
      gsap.fromTo(
        "[data-lightbox-img]",
        { scale: 0.94, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.9, ease: "expo.out", delay: 0.08 },
      );
    },
    { scope: root, dependencies: [zoomed] },
  );

  return (
    <div
      ref={root}
      className={cn("relative flex flex-col gap-3 lg:flex-row-reverse lg:gap-4", className)}
      aria-roledescription="carousel"
      aria-label={`${title} photography`}
    >
      {/* Main plate */}
      <div
        data-gallery-stage
        data-cursor="ZOOM"
        onClick={() => setZoomed(true)}
        className={cn(
          "group relative min-w-0 flex-1 overflow-hidden border border-fg/10",
          "aspect-[4/5] md:aspect-[4/3] lg:aspect-auto lg:h-[calc(100svh-8.5rem)] lg:min-h-[34rem]",
          STUDIO_BACKDROP,
        )}
      >
        <div data-study-photo className="absolute inset-[-6%] will-change-transform">
          <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]">
            {images.map((src, i) => (
              <img
                key={src}
                data-gallery-frame
                src={src}
                alt={i === current ? title : ""}
                decoding="async"
                loading={i === 0 ? "eager" : "lazy"}
                className="img-tone absolute inset-0 h-full w-full object-contain p-[12%] mix-blend-multiply will-change-transform"
                style={{ opacity: i === 0 ? 1 : 0 }}
              />
            ))}
          </div>
        </div>

        {/* Vignette + grain-friendly edge */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(140%_120%_at_50%_50%,transparent_55%,rgba(23,20,15,0.08)_100%)]" />

        {/* Plate chrome */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 sm:p-5 lg:p-6">
          <span className="meta text-fg/55">
            Plate {pad(current + 1)}
            <span className="mx-2 text-fg/25">/</span>
            OBJ-{objectIndex}
          </span>
          <span className="meta inline-flex items-baseline gap-1 overflow-hidden text-fg/70">
            <span data-gallery-counter className="inline-block font-display text-2xl leading-none font-light">
              {pad(current + 1)}
            </span>
            <span className="text-fg/35">/ {pad(Math.max(total, 1))}</span>
          </span>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-4 sm:p-5 lg:p-6">
          {canNavigate ? (
            <div className="flex w-32 gap-1 sm:w-40">
              {images.map((src, i) => (
                <span key={src} className="h-px flex-1 overflow-hidden bg-fg/15">
                  <span
                    className={cn(
                      "block h-full origin-left bg-fg/70 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      i === current ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </span>
              ))}
            </div>
          ) : (
            <span />
          )}
          <span className="meta inline-flex items-center gap-2 text-fg/50 transition-colors duration-500 group-hover:text-fg">
            <Maximize2 className="size-3" strokeWidth={1.25} />
            <span className="hidden sm:inline">Zoom</span>
          </span>
        </div>

        {canNavigate ? (
          <>
            <button
              type="button"
              data-cursor=""
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                goTo(current - 1);
              }}
              className="absolute top-1/2 left-3 z-20 flex size-11 -translate-y-1/2 items-center justify-center border border-fg/15 bg-paper/70 text-fg backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-accent hover:text-accent sm:left-4 lg:-translate-x-2 lg:opacity-0 lg:group-hover:translate-x-0 lg:group-hover:opacity-100"
            >
              <ChevronLeft className="size-4" strokeWidth={1.25} />
            </button>
            <button
              type="button"
              data-cursor=""
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                goTo(current + 1);
              }}
              className="absolute top-1/2 right-3 z-20 flex size-11 -translate-y-1/2 items-center justify-center border border-fg/15 bg-paper/70 text-fg backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-accent hover:text-accent sm:right-4 lg:translate-x-2 lg:opacity-0 lg:group-hover:translate-x-0 lg:group-hover:opacity-100"
            >
              <ChevronRight className="size-4" strokeWidth={1.25} />
            </button>
          </>
        ) : null}
      </div>

      {/* Filmstrip */}
      {canNavigate ? (
        <div className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1 lg:w-16 lg:flex-col lg:gap-2.5 lg:overflow-visible lg:pb-0">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              data-hero-thumb
              data-cursor=""
              aria-label={`View image ${i + 1}`}
              aria-pressed={i === current}
              onClick={() => goTo(i)}
              className={cn(
                "group/thumb relative aspect-[4/5] w-14 shrink-0 overflow-hidden border transition-[border-color,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:w-16 lg:w-full",
                STUDIO_BACKDROP,
                i === current
                  ? "border-fg/70 opacity-100"
                  : "border-fg/10 opacity-55 hover:border-fg/35 hover:opacity-100",
              )}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                decoding="async"
                className="img-tone h-full w-full object-contain p-2 mix-blend-multiply transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/thumb:scale-105"
              />
              <span className="meta pointer-events-none absolute bottom-1 left-1.5 text-[0.55rem] text-fg/50">
                {pad(i + 1)}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {/* Lightbox */}
      {zoomed ? (
        <div
          data-gallery-lightbox
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — enlarged view`}
          onClick={() => setZoomed(false)}
          onWheel={(e) => e.stopPropagation()}
          className={cn(
            "fixed inset-0 z-[90] flex flex-col overscroll-contain touch-none",
            STUDIO_BACKDROP,
          )}
        >
          <div className="flex items-center justify-between px-5 py-5 sm:px-8 md:px-10 lg:px-14">
            <span className="meta text-fg/55">
              {title}
              <span className="mx-2 text-fg/25">/</span>
              {pad(current + 1)} of {pad(total)}
            </span>
            <button
              type="button"
              data-cursor=""
              aria-label="Close enlarged view"
              onClick={(e) => {
                e.stopPropagation();
                setZoomed(false);
              }}
              className="meta inline-flex items-center gap-2 text-fg/70 transition-colors duration-300 hover:text-accent"
            >
              Close
              <X className="size-4" strokeWidth={1.25} />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-5 pb-8 sm:px-16">
            <img
              data-lightbox-img
              src={images[current]}
              alt={title}
              className="img-tone max-h-full max-w-full object-contain mix-blend-multiply"
              onClick={(e) => e.stopPropagation()}
            />

            {canNavigate ? (
              <>
                <button
                  type="button"
                  data-cursor=""
                  aria-label="Previous image"
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(current - 1);
                  }}
                  className="absolute top-1/2 left-4 flex size-12 -translate-y-1/2 items-center justify-center border border-fg/15 text-fg transition-colors duration-300 hover:border-accent hover:text-accent sm:left-8"
                >
                  <ChevronLeft className="size-4" strokeWidth={1.25} />
                </button>
                <button
                  type="button"
                  data-cursor=""
                  aria-label="Next image"
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(current + 1);
                  }}
                  className="absolute top-1/2 right-4 flex size-12 -translate-y-1/2 items-center justify-center border border-fg/15 text-fg transition-colors duration-300 hover:border-accent hover:text-accent sm:right-8"
                >
                  <ChevronRight className="size-4" strokeWidth={1.25} />
                </button>
              </>
            ) : null}
          </div>

          {canNavigate ? (
            <div className="flex justify-center gap-2 px-5 pb-6">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  data-cursor=""
                  aria-label={`View image ${i + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(i);
                  }}
                  className={cn(
                    "h-px w-8 transition-colors duration-500",
                    i === current ? "bg-fg" : "bg-fg/20 hover:bg-fg/50",
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
