import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion";
import { LOOKBOOK, OBJECTS, STUDY } from "@/lib/data";
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
  mobile?: OrbitConfig | false;
  src?: string;
  alt?: string;
  className?: string;
};

/**
 * Stable orbital composition. Relative angular spacing is fixed;
 * scroll advances a shared turn angle so every object travels the
 * same circular path in the same direction.
 *
 * Radii are % of the orbit field so paths scale fluidly with the viewport.
 * Desktop: wide ellipse using full viewport. Mobile: taller ellipse,
 * fewer/smaller objects, kept clear of central copy.
 */
const ORBIT: OrbitItem[] = [
  {
    id: "photo-a",
    kind: "photo",
    src: STUDY.object.img,
    alt: `${STUDY.object.name} study`,
    desktop: { angle: 205, rx: 46, ry: 38, scale: 1 },
    mobile: { angle: 200, rx: 36, ry: 44, scale: 0.58 },
    className:
      "h-[min(36vmin,22rem)] w-[min(24vmin,15rem)] overflow-hidden rounded-[1.6rem] shadow-[0_20px_50px_-28px_rgba(23,20,15,0.45)] sm:rounded-[2rem] md:h-[min(42vmin,28rem)] md:w-[min(28vmin,19rem)] md:rounded-[2.4rem]",
  },
  {
    id: "photo-b",
    kind: "photo",
    src: LOOKBOOK[0].src,
    alt: "Object in situ",
    desktop: { angle: 25, rx: 44, ry: 36, scale: 1 },
    mobile: { angle: 20, rx: 34, ry: 42, scale: 0.55 },
    className:
      "h-[min(30vmin,18rem)] w-[min(21vmin,13rem)] overflow-hidden rounded-[1.4rem] shadow-[0_18px_46px_-26px_rgba(23,20,15,0.4)] sm:rounded-[1.8rem] md:h-[min(38vmin,24rem)] md:w-[min(26vmin,17rem)] md:rounded-[2.2rem]",
  },
  {
    id: "forest",
    kind: "disc",
    desktop: { angle: 290, rx: 42, ry: 42, scale: 1 },
    mobile: { angle: 285, rx: 30, ry: 46, scale: 0.72 },
    className:
      "size-[min(12vmin,6.5rem)] rounded-full bg-[radial-gradient(circle_at_35%_30%,#2f5a45_0%,#163528_55%,#0f241c_100%)] shadow-[inset_0_0_24px_rgba(0,0,0,0.25)] md:size-[min(16vmin,9rem)]",
  },
  {
    id: "stone",
    kind: "orb",
    desktop: { angle: 110, rx: 40, ry: 40, scale: 1 },
    mobile: { angle: 105, rx: 28, ry: 44, scale: 0.8 },
    className:
      "size-[min(6vmin,3.5rem)] rounded-full bg-[#6b5748] md:size-[min(8vmin,5rem)]",
  },
  {
    id: "pill-sage",
    kind: "pill",
    desktop: { angle: 330, rx: 48, ry: 44, scale: 1 },
    mobile: { angle: 325, rx: 32, ry: 48, scale: 0.78 },
    className:
      "h-[min(3.5vmin,1.5rem)] w-[min(12vmin,8rem)] rounded-full bg-[linear-gradient(90deg,#7a9178_0%,#efe9df_100%)] md:h-7 md:w-40",
  },
  {
    id: "pill-clay",
    kind: "pill",
    desktop: { angle: 150, rx: 46, ry: 42, scale: 1 },
    mobile: { angle: 145, rx: 30, ry: 46, scale: 0.78 },
    className:
      "h-[min(3vmin,1.25rem)] w-[min(11vmin,7rem)] rounded-full bg-[linear-gradient(90deg,#c4a484_0%,#efe9df_100%)] md:h-6 md:w-36",
  },
  {
    id: "pill-taupe",
    kind: "pill",
    desktop: { angle: 60, rx: 50, ry: 34, scale: 0.9 },
    mobile: false,
    className:
      "hidden h-5 w-32 rounded-full bg-[linear-gradient(90deg,#a8998c_0%,#efe9df_100%)] md:block",
  },
  {
    id: "moss",
    kind: "disc",
    desktop: { angle: 245, rx: 38, ry: 40, scale: 0.85 },
    mobile: false,
    className:
      "hidden size-[min(12vmin,7rem)] rounded-full bg-[radial-gradient(circle_at_60%_40%,#3d5c48_0%,#1c3328_70%)] md:block",
  },
  {
    id: "fragment",
    kind: "photo",
    src: OBJECTS[0].img,
    alt: "Material fragment",
    desktop: { angle: 175, rx: 50, ry: 32, scale: 0.7 },
    mobile: false,
    className:
      "hidden h-[min(18vmin,12rem)] w-[min(14vmin,9rem)] overflow-hidden rounded-[1.4rem] md:block",
  },
];

const STATES = STUDY.states;
const STATE_COUNT = STATES.length;
const SCROLL_VH = 2.6;
const FULL_TURN = Math.PI * 2;

function configFor(item: OrbitItem, mobile: boolean): OrbitConfig | null {
  if (mobile) {
    if (item.mobile === false) return null;
    return item.mobile ?? item.desktop;
  }
  return item.desktop;
}

/** Self-rotation while traveling the orbit — pills stay level. */
function selfRotation(kind: OrbitItem["kind"], angleRad: number): number {
  if (kind === "pill" || kind === "orb" || kind === "disc") return 0;
  // Photos: slight tilt only, never large swings
  return Math.sin(angleRad) * 4.5;
}

/**
 * "Anatomy" — scroll-pinned orbital study.
 * One continuous circular motion system around fixed central copy.
 */
export function ObjectStudy() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const discoverBtn = useRef<HTMLButtonElement>(null);
  const discoverLabel = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const stageEl = stage.current;
      const fieldEl = field.current;
      if (!stageEl || !fieldEl) return;

      const mm = gsap.matchMedia();
      const copies = gsap.utils.toArray<HTMLElement>("[data-study-copy]", stageEl);

      const setCounter = (index: number) => {
        if (counter.current) {
          counter.current.textContent = String(index + 1).padStart(2, "0");
        }
      };

      const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

      const layoutOrbit = (progress: number) => {
        const mobile = isMobile();
        const rxUnit = fieldEl.offsetWidth / 100;
        const ryUnit = fieldEl.offsetHeight / 100;
        const turn = progress * FULL_TURN;

        ORBIT.forEach((item) => {
          const el = fieldEl.querySelector<HTMLElement>(`[data-orbit="${item.id}"]`);
          if (!el) return;

          const cfg = configFor(item, mobile);
          if (!cfg) {
            gsap.set(el, { autoAlpha: 0 });
            return;
          }

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
        });
      };

      // ----- discovery dot hover (fine pointer only) -----
      mm.add("(pointer: fine)", () => {
        const btn = discoverBtn.current;
        const label = discoverLabel.current;
        if (!btn || !label) return;

        gsap.set(btn, { scale: 14 / 72 });
        gsap.set(label, { autoAlpha: 0, scale: 0.7 });

        const expand = () => {
          gsap.to(btn, {
            scale: 1,
            duration: 0.55,
            ease: "power3.out",
            overwrite: "auto",
          });
          gsap.to(label, {
            autoAlpha: 1,
            scale: 1,
            duration: 0.4,
            delay: 0.08,
            ease: "power3.out",
            overwrite: "auto",
          });
        };

        const collapse = () => {
          gsap.to(label, {
            autoAlpha: 0,
            scale: 0.7,
            duration: 0.25,
            ease: "power2.in",
            overwrite: "auto",
          });
          gsap.to(btn, {
            scale: 14 / 72,
            duration: 0.45,
            delay: 0.05,
            ease: "power3.inOut",
            overwrite: "auto",
          });
        };

        btn.addEventListener("pointerenter", expand);
        btn.addEventListener("pointerleave", collapse);
        btn.addEventListener("focus", expand);
        btn.addEventListener("blur", collapse);

        return () => {
          btn.removeEventListener("pointerenter", expand);
          btn.removeEventListener("pointerleave", collapse);
          btn.removeEventListener("focus", expand);
          btn.removeEventListener("blur", collapse);
        };
      });

      // ----- scroll-driven continuous orbit -----
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(copies, { autoAlpha: 0, y: 28, scale: 0.97 });
        gsap.set(copies[0], { autoAlpha: 1, y: 0, scale: 1 });
        setCounter(0);
        layoutOrbit(0);

        const endDist = () => `+=${window.innerHeight * SCROLL_VH}`;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: endDist,
            pin: stageEl,
            scrub: 0.65,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              layoutOrbit(self.progress);
              const idx =
                self.progress < 1 / 3 ? 0 : self.progress < 2 / 3 ? 1 : 2;
              setCounter(idx);
            },
            onRefresh: (self) => {
              layoutOrbit(self.progress);
            },
          },
        });

        // Text crossfades at ~33% / ~66% — independent of orbital positions
        tl.to(copies[0], { autoAlpha: 0, y: -22, scale: 0.96, duration: 0.1 }, 0.3);
        tl.fromTo(
          copies[1],
          { autoAlpha: 0, y: 28, scale: 0.97 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.1 },
          0.3,
        );

        tl.to(copies[1], { autoAlpha: 0, y: -22, scale: 0.96, duration: 0.1 }, 0.6);
        tl.fromTo(
          copies[2],
          { autoAlpha: 0, y: 28, scale: 0.97 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.1 },
          0.6,
        );

        // Keep timeline spanning full pin distance for scrub mapping
        tl.to({}, { duration: 0.3 }, 0.7);

        // Disc texture spin — nested, synchronized with the same scroll range
        gsap.utils.toArray<HTMLElement>("[data-spin]", stageEl).forEach((el, i) => {
          gsap.fromTo(
            el,
            { rotation: 0 },
            {
              rotation: i % 2 === 0 ? 160 : -130,
              ease: "none",
              scrollTrigger: {
                trigger: root.current,
                start: "top top",
                end: endDist,
                scrub: true,
              },
            },
          );
        });
      });

      // Reduced motion: static orbital frame, no pin
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(copies, { autoAlpha: 0, clearProps: "transform" });
        gsap.set(copies[0], { autoAlpha: 1 });
        setCounter(0);
        layoutOrbit(0);
        gsap.set(discoverBtn.current, { scale: 14 / 72 });
        gsap.set(discoverLabel.current, { autoAlpha: 0 });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="anatomy" data-theme="paper" className="relative">
      <div
        ref={stage}
        className="relative flex h-dvh min-h-dvh w-full items-center justify-center overflow-hidden px-[4vw] py-[max(4rem,8vh)] md:px-[2vw] md:py-0"
      >
        {/* Section chrome */}
        <div className="pointer-events-none absolute left-[4vw] top-[max(1.5rem,4vh)] z-20 md:left-[2.5vw] md:top-[max(2.5rem,6vh)]">
          <span className="meta text-fg/50">N°04 — Anatomy</span>
          <div className="mt-3 flex items-baseline gap-1 font-display text-4xl font-light md:text-5xl">
            <span ref={counter}>01</span>
            <span className="text-lg text-fg/35 md:text-xl">
              / {String(STATE_COUNT).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute right-[4vw] top-[max(1.5rem,4vh)] z-20 text-right md:right-[2.5vw] md:top-[max(2.5rem,6vh)]">
          <span className="meta text-fg/45">OBJ-{STUDY.object.index}</span>
          <p className="mt-2 font-display text-lg font-light text-fg/70 md:text-xl">
            {STUDY.object.name}
          </p>
        </div>

        {/* Orbit field — full viewport; radii (% of this box) scale fluidly */}
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
                  className="img-tone h-full w-full object-cover"
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

          {/* Discover stays fixed at center — not part of the orbital path */}
          <div className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
            <button
              ref={discoverBtn}
              type="button"
              aria-label="Explore object detail"
              className="flex size-[4.5rem] items-center justify-center overflow-hidden rounded-full bg-accent will-change-transform"
            >
              <span
                ref={discoverLabel}
                className="meta pointer-events-none select-none text-[0.55rem] leading-none tracking-[0.2em] text-paper"
              >
                Explore
              </span>
            </button>
          </div>

          {/* Central editorial statements — constrained so orbit clears the copy */}
          <div className="relative z-10 mx-auto w-[min(78%,17.5rem)] sm:w-[min(70%,22rem)] md:w-[min(38vw,36rem)] lg:w-[min(34vw,40rem)]">
            {STATES.map((state) => (
              <p
                key={state.id}
                data-study-copy
                className="absolute inset-0 flex items-center justify-center text-center font-display text-[1.45rem] leading-[1.3] font-light tracking-[-0.01em] sm:text-[1.65rem] sm:leading-[1.28] md:text-4xl md:leading-[1.3] lg:text-[2.75rem]"
              >
                <span>
                  {state.parts.map((part, i) => (
                    <span
                      key={`${state.id}-${i}`}
                      className={part.tone === "strong" ? "text-fg" : "text-fg/38"}
                    >
                      {part.text}
                    </span>
                  ))}
                </span>
              </p>
            ))}
            <p
              aria-hidden
              className="invisible text-center font-display text-[1.45rem] leading-[1.3] font-light sm:text-[1.65rem] sm:leading-[1.28] md:text-4xl md:leading-[1.3] lg:text-[2.75rem]"
            >
              {STATES[0].parts.map((p) => p.text).join("")}
            </p>
          </div>
        </div>

        <p className="pointer-events-none absolute bottom-[max(1.25rem,3vh)] left-1/2 z-20 hidden max-w-xs -translate-x-1/2 text-center text-xs leading-relaxed text-fg/40 md:block">
          {STUDY.intro}
        </p>
      </div>
    </section>
  );
}
