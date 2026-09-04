import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion";
import { STUDY } from "@/lib/data";
import { cn } from "@/lib/utils";

type OrbitConfig = {
  /** Starting angle in degrees (0 = right, clockwise as scroll progresses) */
  angle: number;
  /** Elliptical radii as % of the orbit field — scales with viewport */
  rx: number;
  ry: number;
  scale: number;
};

type OrbitItem = {
  id: string;
  kind: "photo" | "disc" | "pill" | "orb";
  desktop: OrbitConfig;
  /** Mobile orbit config; omit to reuse desktop; `false` to hide on mobile */
  mobile?: OrbitConfig | false;
  src?: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
};

/**
 * Stable orbital composition. Relative angular spacing is fixed;
 * scroll advances a shared turn angle so every object travels the
 * same circular path in the same direction.
 *
 * Radii are % of the orbit field so paths scale fluidly with the viewport.
 * Shared on mobile and desktop — mobile uses slightly tighter radii.
 */
const ORBIT: OrbitItem[] = [
  {
    id: "photo-a",
    kind: "photo",
    src: STUDY.img,
    alt: `${STUDY.object.name} study`,
    desktop: { angle: 205, rx: 46, ry: 38, scale: 1 },
    mobile: { angle: 205, rx: 42, ry: 34, scale: 0.92 },
    className:
      "h-[min(40vmin,26rem)] w-[min(40vmin,26rem)] md:h-[min(48vmin,32rem)] md:w-[min(48vmin,32rem)]",
    imgClassName: "object-contain",
  },
  {
    id: "photo-b",
    kind: "photo",
    src: STUDY.companionImg,
    alt: "Object in situ",
    desktop: { angle: 25, rx: 44, ry: 36, scale: 1 },
    mobile: { angle: 25, rx: 40, ry: 32, scale: 0.9 },
    className:
      "h-[min(34vmin,22rem)] w-[min(34vmin,22rem)] md:h-[min(42vmin,28rem)] md:w-[min(42vmin,28rem)]",
    imgClassName: "object-contain",
  },
  {
    id: "forest",
    kind: "disc",
    desktop: { angle: 290, rx: 42, ry: 42, scale: 1 },
    mobile: { angle: 290, rx: 38, ry: 38, scale: 0.9 },
    className:
      "size-[min(12vmin,6.5rem)] rounded-full bg-[radial-gradient(circle_at_35%_30%,#2f5a45_0%,#163528_55%,#0f241c_100%)] shadow-[inset_0_0_24px_rgba(0,0,0,0.25)] md:size-[min(16vmin,9rem)]",
  },
  {
    id: "stone",
    kind: "orb",
    desktop: { angle: 110, rx: 40, ry: 40, scale: 1 },
    mobile: { angle: 110, rx: 36, ry: 36, scale: 0.9 },
    className:
      "size-[min(6vmin,3.5rem)] rounded-full bg-earth md:size-[min(8vmin,5rem)]",
  },
  {
    id: "pill-sage",
    kind: "pill",
    desktop: { angle: 330, rx: 48, ry: 44, scale: 1 },
    mobile: { angle: 330, rx: 44, ry: 40, scale: 0.85 },
    className:
      "h-[min(3.5vmin,1.5rem)] w-[min(12vmin,8rem)] rounded-full bg-[linear-gradient(90deg,var(--color-sage)_0%,var(--color-paper)_100%)] md:h-7 md:w-40",
  },
  {
    id: "pill-clay",
    kind: "pill",
    desktop: { angle: 150, rx: 46, ry: 42, scale: 1 },
    mobile: { angle: 150, rx: 42, ry: 38, scale: 0.85 },
    className:
      "h-[min(3vmin,1.25rem)] w-[min(11vmin,7rem)] rounded-full bg-[linear-gradient(90deg,var(--color-clay)_0%,var(--color-paper)_100%)] md:h-6 md:w-36",
  },
  {
    id: "pill-taupe",
    kind: "pill",
    desktop: { angle: 60, rx: 50, ry: 34, scale: 0.9 },
    mobile: { angle: 60, rx: 46, ry: 30, scale: 0.8 },
    className:
      "h-5 w-32 rounded-full bg-[linear-gradient(90deg,var(--color-stone)_0%,var(--color-paper)_100%)]",
  },
  {
    id: "moss",
    kind: "disc",
    desktop: { angle: 245, rx: 38, ry: 40, scale: 0.85 },
    mobile: { angle: 245, rx: 34, ry: 36, scale: 0.75 },
    className:
      "size-[min(12vmin,7rem)] rounded-full bg-[radial-gradient(circle_at_60%_40%,#3d5c48_0%,#1c3328_70%)]",
  },
  {
    id: "fragment",
    kind: "photo",
    src: STUDY.fragmentImg,
    alt: "Leone Urn study",
    desktop: { angle: 175, rx: 50, ry: 32, scale: 0.7 },
    mobile: { angle: 175, rx: 46, ry: 28, scale: 0.6 },
    className: "h-[min(22vmin,14rem)] w-[min(22vmin,14rem)]",
    imgClassName: "object-contain",
  },
];

const STATES = STUDY.states;
const STATE_COUNT = STATES.length;
const SCROLL_VH = 2.6;
const FULL_TURN = Math.PI * 2;
/** Shared scrub weight across breakpoints. */
const SCRUB = 0.65;
/**
 * Timeline positions where copy fades to the next state (and the counter advances).
 * For 3 states this yields [0.3, 0.6] — matching the original editorial beats.
 */
const COPY_SWITCH_POINTS = Array.from(
  { length: Math.max(0, STATE_COUNT - 1) },
  (_, i) => ((i + 1) / STATE_COUNT) * 0.9,
);

/** Self-rotation while traveling the orbit — pills stay level. */
function selfRotation(kind: OrbitItem["kind"], angleRad: number): number {
  if (kind === "pill" || kind === "orb" || kind === "disc") return 0;
  return Math.sin(angleRad) * 4.5;
}

function resolveOrbitConfig(
  item: OrbitItem,
  isMobile: boolean,
): OrbitConfig | null {
  if (isMobile) {
    if (item.mobile === false) return null;
    if (item.mobile) return item.mobile;
  }
  return item.desktop;
}

/** Counter / copy index from scroll progress using the same switch points. */
function stateIndexFromProgress(progress: number): number {
  let idx = 0;
  for (const point of COPY_SWITCH_POINTS) {
    if (progress >= point) idx += 1;
    else break;
  }
  return Math.min(idx, STATE_COUNT - 1);
}

/** Wait for images in a container so pin/orbit measurements aren't stale. */
function whenImagesReady(container: HTMLElement): Promise<void> {
  const imgs = Array.from(container.querySelectorAll("img"));
  if (imgs.length === 0) return Promise.resolve();

  return Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      if (typeof img.decode === "function") {
        return img.decode().catch(() => undefined);
      }
      return new Promise<void>((resolve) => {
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
      });
    }),
  ).then(() => undefined);
}

/** Refresh ScrollTrigger once after images load; abort-safe for matchMedia teardown. */
function refreshAfterImages(container: HTMLElement): () => void {
  let cancelled = false;
  let didRefresh = false;

  whenImagesReady(container).then(() => {
    if (cancelled || didRefresh) return;
    didRefresh = true;
    ScrollTrigger.refresh();
  });

  return () => {
    cancelled = true;
  };
}

/**
 * "Anatomy" — Journal study.
 * Scroll-pinned orbital composition around central copy (mobile + desktop).
 */
export function ObjectStudy() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      const setupOrbit = (isMobile: boolean) => {
        const stageEl = stage.current;
        const fieldEl = field.current;
        const rootEl = root.current;
        if (!stageEl || !fieldEl || !rootEl) return;

        const copies = gsap.utils.toArray<HTMLElement>(
          "[data-study-copy]",
          stageEl,
        );

        const orbitEls = ORBIT.map((item) => ({
          item,
          el: fieldEl.querySelector<HTMLElement>(`[data-orbit="${item.id}"]`),
          cfg: resolveOrbitConfig(item, isMobile),
        })).filter(
          (
            entry,
          ): entry is {
            item: OrbitItem;
            el: HTMLElement;
            cfg: OrbitConfig;
          } => entry.el != null && entry.cfg != null,
        );

        // Hide items explicitly disabled on this breakpoint
        for (const item of ORBIT) {
          const el = fieldEl.querySelector<HTMLElement>(
            `[data-orbit="${item.id}"]`,
          );
          if (!el) continue;
          const cfg = resolveOrbitConfig(item, isMobile);
          if (!cfg) gsap.set(el, { autoAlpha: 0 });
        }

        const setCounter = (index: number) => {
          if (counter.current) {
            counter.current.textContent = String(index + 1).padStart(2, "0");
          }
        };

        const layoutOrbit = (progress: number) => {
          const rxUnit = fieldEl.offsetWidth / 100;
          const ryUnit = fieldEl.offsetHeight / 100;
          const turn = progress * FULL_TURN;

          for (const { item, el, cfg } of orbitEls) {
            const angle = (cfg.angle * Math.PI) / 180 + turn;
            const x = Math.cos(angle) * cfg.rx * rxUnit;
            const y = Math.sin(angle) * cfg.ry * ryUnit;

            gsap.set(el, {
              x,
              y,
              rotation: selfRotation(item.kind, angle),
              scale: cfg.scale,
              autoAlpha: 1,
              transformOrigin: "50% 50%",
            });
          }
        };

        gsap.set(copies, { autoAlpha: 0, y: 28, scale: 0.97 });
        gsap.set(copies[0], { autoAlpha: 1, y: 0, scale: 1 });
        setCounter(0);
        layoutOrbit(0);

        const endDist = () => `+=${window.innerHeight * SCROLL_VH}`;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: rootEl,
            start: "top top",
            end: endDist,
            pin: stageEl,
            scrub: SCRUB,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              layoutOrbit(self.progress);
              setCounter(stateIndexFromProgress(self.progress));
            },
            onRefresh: (self) => {
              layoutOrbit(self.progress);
            },
          },
        });

        for (let i = 0; i < COPY_SWITCH_POINTS.length; i++) {
          const at = COPY_SWITCH_POINTS[i];
          const outgoing = copies[i];
          const incoming = copies[i + 1];
          if (!outgoing || !incoming) continue;

          tl.to(
            outgoing,
            { autoAlpha: 0, y: -22, scale: 0.96, duration: 0.1 },
            at,
          );
          tl.fromTo(
            incoming,
            { autoAlpha: 0, y: 28, scale: 0.97 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.1 },
            at,
          );
        }

        const lastSwitch =
          COPY_SWITCH_POINTS[COPY_SWITCH_POINTS.length - 1] ?? 0;
        const holdStart = lastSwitch + 0.1;
        tl.to({}, { duration: Math.max(0, 1 - holdStart) }, holdStart);

        gsap.utils
          .toArray<HTMLElement>("[data-spin]", stageEl)
          .forEach((el, i) => {
            gsap.fromTo(
              el,
              { rotation: 0 },
              {
                rotation: i % 2 === 0 ? 160 : -130,
                ease: "none",
                scrollTrigger: {
                  trigger: rootEl,
                  start: "top top",
                  end: endDist,
                  scrub: SCRUB,
                },
              },
            );
          });

        return refreshAfterImages(stageEl);
      };

      const setupReduced = (isMobile: boolean) => {
        const stageEl = stage.current;
        const fieldEl = field.current;
        if (!stageEl || !fieldEl) return;

        const copies = gsap.utils.toArray<HTMLElement>(
          "[data-study-copy]",
          stageEl,
        );
        gsap.set(copies, { autoAlpha: 0, clearProps: "transform" });
        gsap.set(copies[0], { autoAlpha: 1 });
        if (counter.current) counter.current.textContent = "01";

        gsap.set(gsap.utils.toArray<HTMLElement>("[data-spin]", stageEl), {
          clearProps: "transform",
        });

        const layoutStatic = () => {
          const rxUnit = fieldEl.offsetWidth / 100;
          const ryUnit = fieldEl.offsetHeight / 100;
          ORBIT.forEach((item) => {
            const el = fieldEl.querySelector<HTMLElement>(
              `[data-orbit="${item.id}"]`,
            );
            if (!el) return;
            const cfg = resolveOrbitConfig(item, isMobile);
            if (!cfg) {
              gsap.set(el, { autoAlpha: 0 });
              return;
            }
            const angle = (cfg.angle * Math.PI) / 180;
            gsap.set(el, {
              x: Math.cos(angle) * cfg.rx * rxUnit,
              y: Math.sin(angle) * cfg.ry * ryUnit,
              rotation: selfRotation(item.kind, angle),
              scale: cfg.scale,
              autoAlpha: 1,
              transformOrigin: "50% 50%",
            });
          });
        };

        layoutStatic();

        let cancelled = false;
        whenImagesReady(stageEl).then(() => {
          if (cancelled) return;
          layoutStatic();
        });

        return () => {
          cancelled = true;
        };
      };

      mm.add(
        "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        () => setupOrbit(true),
      );
      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => setupOrbit(false),
      );
      mm.add("(max-width: 767px) and (prefers-reduced-motion: reduce)", () =>
        setupReduced(true),
      );
      mm.add("(min-width: 768px) and (prefers-reduced-motion: reduce)", () =>
        setupReduced(false),
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="anatomy"
      data-theme="paper"
      className="relative overflow-x-clip"
    >
      <div
        ref={stage}
        className="relative flex h-dvh min-h-dvh w-full items-center justify-center overflow-hidden px-[2vw]"
      >
        <div className="pointer-events-none absolute left-[2.5vw] top-[max(1.75rem,4vh)] z-20 md:top-[max(2.5rem,6vh)]">
          <span className="meta text-fg/50">N°04 — Anatomy</span>
          <div className="mt-3 flex items-baseline gap-1 font-display text-[2.35rem] font-light leading-none md:mt-4 md:text-5xl">
            <span ref={counter}>01</span>
            <span className="text-base text-fg/35 md:text-xl">
              / {String(STATE_COUNT).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute right-[2.5vw] top-[max(1.75rem,4vh)] z-20 text-right md:top-[max(2.5rem,6vh)]">
          <span className="meta text-fg/45">OBJ-{STUDY.object.index}</span>
          <p className="mt-3 max-w-[40vw] font-display text-base font-light leading-snug text-fg/70 md:mt-4 md:max-w-none md:text-xl">
            {STUDY.object.name}
          </p>
        </div>

        <div
          ref={field}
          data-orbit-field
          className="relative z-0 flex h-full w-full max-w-none items-center justify-center"
        >
          {ORBIT.map((item) => (
            <div
              key={item.id}
              data-orbit={item.id}
              aria-hidden={item.kind !== "photo"}
              className={cn(
                "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform",
                item.className,
              )}
            >
              {item.kind === "photo" && item.src ? (
                <img
                  src={item.src}
                  alt={item.alt ?? ""}
                  loading="lazy"
                  className={cn(
                    "img-tone h-full w-full",
                    item.imgClassName ?? "object-cover",
                  )}
                />
              ) : null}
              {item.kind === "disc" ? (
                <span
                  data-spin
                  className="pointer-events-none absolute inset-0 rounded-full opacity-45"
                  style={{
                    background:
                      "repeating-conic-gradient(from 0deg, transparent 0deg 6deg, rgba(0,0,0,0.18) 6deg 7deg)",
                  }}
                />
              ) : null}
            </div>
          ))}

          <div className="relative z-10 mx-auto w-[min(78vw,22rem)] md:w-[min(38vw,36rem)] lg:w-[min(34vw,40rem)]">
            {STATES.map((state) => (
              <p
                key={state.id}
                data-study-copy
                className="absolute inset-0 flex items-center justify-center text-center font-display text-[1.35rem] leading-[1.32] font-light tracking-[-0.01em] md:text-4xl md:leading-[1.3] lg:text-[2.75rem]"
              >
                <span>
                  {state.parts.map((part, i) => (
                    <span
                      key={`${state.id}-${i}`}
                      className={
                        part.tone === "strong" ? "text-fg" : "text-fg/38"
                      }
                    >
                      {part.text}
                    </span>
                  ))}
                </span>
              </p>
            ))}
            <p
              aria-hidden
              className="invisible text-center font-display text-[1.35rem] leading-[1.32] font-light md:text-4xl md:leading-[1.3] lg:text-[2.75rem]"
            >
              {STATES[0].parts.map((p) => p.text).join("")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
