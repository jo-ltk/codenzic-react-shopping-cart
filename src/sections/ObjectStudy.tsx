import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion";
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
 * Desktop only — mobile uses a horizontal index track instead.
 */
const ORBIT: OrbitItem[] = [
  {
    id: "photo-a",
    kind: "photo",
    src: STUDY.img,
    alt: `${STUDY.object.name} study`,
    desktop: { angle: 205, rx: 46, ry: 38, scale: 1 },
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
    className:
      "h-[min(34vmin,22rem)] w-[min(34vmin,22rem)] md:h-[min(42vmin,28rem)] md:w-[min(42vmin,28rem)]",
    imgClassName: "object-contain",
  },
  {
    id: "forest",
    kind: "disc",
    desktop: { angle: 290, rx: 42, ry: 42, scale: 1 },
    className:
      "size-[min(12vmin,6.5rem)] rounded-full bg-[radial-gradient(circle_at_35%_30%,#2f5a45_0%,#163528_55%,#0f241c_100%)] shadow-[inset_0_0_24px_rgba(0,0,0,0.25)] md:size-[min(16vmin,9rem)]",
  },
  {
    id: "stone",
    kind: "orb",
    desktop: { angle: 110, rx: 40, ry: 40, scale: 1 },
    className:
      "size-[min(6vmin,3.5rem)] rounded-full bg-earth md:size-[min(8vmin,5rem)]",
  },
  {
    id: "pill-sage",
    kind: "pill",
    desktop: { angle: 330, rx: 48, ry: 44, scale: 1 },
    className:
      "h-[min(3.5vmin,1.5rem)] w-[min(12vmin,8rem)] rounded-full bg-[linear-gradient(90deg,var(--color-sage)_0%,var(--color-paper)_100%)] md:h-7 md:w-40",
  },
  {
    id: "pill-clay",
    kind: "pill",
    desktop: { angle: 150, rx: 46, ry: 42, scale: 1 },
    className:
      "h-[min(3vmin,1.25rem)] w-[min(11vmin,7rem)] rounded-full bg-[linear-gradient(90deg,var(--color-clay)_0%,var(--color-paper)_100%)] md:h-6 md:w-36",
  },
  {
    id: "pill-taupe",
    kind: "pill",
    desktop: { angle: 60, rx: 50, ry: 34, scale: 0.9 },
    className:
      "h-5 w-32 rounded-full bg-[linear-gradient(90deg,var(--color-stone)_0%,var(--color-paper)_100%)]",
  },
  {
    id: "moss",
    kind: "disc",
    desktop: { angle: 245, rx: 38, ry: 40, scale: 0.85 },
    className:
      "size-[min(12vmin,7rem)] rounded-full bg-[radial-gradient(circle_at_60%_40%,#3d5c48_0%,#1c3328_70%)]",
  },
  {
    id: "fragment",
    kind: "photo",
    src: STUDY.fragmentImg,
    alt: "Leone Urn study",
    desktop: { angle: 175, rx: 50, ry: 32, scale: 0.7 },
    className: "h-[min(22vmin,14rem)] w-[min(22vmin,14rem)]",
    imgClassName: "object-contain",
  },
];

const STATES = STUDY.states;
const STATE_COUNT = STATES.length;
const SCROLL_VH = 2.6;
const FULL_TURN = Math.PI * 2;

const MOBILE_PANELS = [
  { state: STATES[0], src: STUDY.img, alt: `${STUDY.object.name} study` },
  { state: STATES[1], src: STUDY.companionImg, alt: "Object in situ" },
  { state: STATES[2], src: STUDY.fragmentImg, alt: "Study fragment" },
] as const;

/** Self-rotation while traveling the orbit — pills stay level. */
function selfRotation(kind: OrbitItem["kind"], angleRad: number): number {
  if (kind === "pill" || kind === "orb" || kind === "disc") return 0;
  return Math.sin(angleRad) * 4.5;
}

/**
 * "Anatomy" — Journal study.
 * Desktop: scroll-pinned orbital composition around central copy.
 * Mobile: horizontal L→R track through the three editorial states.
 */
export function ObjectStudy() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const mobileTrack = useRef<HTMLDivElement>(null);
  const mobileCounter = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // ----- Mobile: pinned horizontal track -----
      mm.add(
        "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        () => {
          const trackEl = mobileTrack.current;
          if (!trackEl) return;

          const distance = () => trackEl.scrollWidth - window.innerWidth;

          const setMobileCounter = (progress: number) => {
            if (!mobileCounter.current) return;
            const idx = Math.min(
              STATE_COUNT - 1,
              Math.floor(progress * STATE_COUNT),
            );
            mobileCounter.current.textContent = String(idx + 1).padStart(2, "0");
          };

          setMobileCounter(0);

          gsap.to(trackEl, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: () => `+=${distance()}`,
              scrub: 1,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => setMobileCounter(self.progress),
            },
          });
        },
      );

      mm.add("(max-width: 767px) and (prefers-reduced-motion: reduce)", () => {
        const trackEl = mobileTrack.current;
        const scroller = root.current;
        if (!trackEl || !scroller) return;
        scroller.style.overflowX = "auto";
        scroller.style.setProperty("-webkit-overflow-scrolling", "touch");
        trackEl.style.width = "max-content";
        if (mobileCounter.current) {
          mobileCounter.current.textContent = "01";
        }
        return () => {
          scroller.style.overflowX = "";
          scroller.style.removeProperty("-webkit-overflow-scrolling");
          trackEl.style.width = "";
        };
      });

      // ----- Desktop: scroll-driven continuous orbit -----
      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const stageEl = stage.current;
          const fieldEl = field.current;
          if (!stageEl || !fieldEl) return;

          const copies = gsap.utils.toArray<HTMLElement>(
            "[data-study-copy]",
            stageEl,
          );

          const setCounter = (index: number) => {
            if (counter.current) {
              counter.current.textContent = String(index + 1).padStart(2, "0");
            }
          };

          const layoutOrbit = (progress: number) => {
            const rxUnit = fieldEl.offsetWidth / 100;
            const ryUnit = fieldEl.offsetHeight / 100;
            const turn = progress * FULL_TURN;

            ORBIT.forEach((item) => {
              const el = fieldEl.querySelector<HTMLElement>(
                `[data-orbit="${item.id}"]`,
              );
              if (!el) return;

              const cfg = item.desktop;
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

          tl.to({}, { duration: 0.3 }, 0.7);

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
        },
      );

      mm.add("(min-width: 768px) and (prefers-reduced-motion: reduce)", () => {
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

        const rxUnit = fieldEl.offsetWidth / 100;
        const ryUnit = fieldEl.offsetHeight / 100;
        ORBIT.forEach((item) => {
          const el = fieldEl.querySelector<HTMLElement>(
            `[data-orbit="${item.id}"]`,
          );
          if (!el) return;
          const cfg = item.desktop;
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
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="anatomy" data-theme="paper" className="relative overflow-x-clip">
      {/* Mobile — horizontal L→R journal track */}
      <div className="flex min-h-dvh items-center md:hidden">
        <div
          ref={mobileTrack}
          className="flex w-max flex-row items-center gap-[10vw] px-5 py-10"
        >
          <div className="w-[78vw] shrink-0">
            <span className="meta text-fg/50">N°04 — Anatomy</span>
            <div className="mt-4 flex items-baseline gap-1 font-display text-[2.35rem] font-light leading-none">
              <span ref={mobileCounter}>01</span>
              <span className="text-base text-fg/35">
                / {String(STATE_COUNT).padStart(2, "0")}
              </span>
            </div>
            <p className="meta mt-6 text-fg/45">OBJ-{STUDY.object.index}</p>
            <h2 className="mt-2 font-display text-3xl font-light leading-snug">
              {STUDY.object.name}
            </h2>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-fg/55">
              Three beats around one object. Scroll sideways through the study.
            </p>
          </div>

          {MOBILE_PANELS.map((panel, i) => (
            <article key={panel.state.id} className="w-[78vw] shrink-0">
              <span className="meta text-fg/45">
                {String(i + 1).padStart(2, "0")} / {String(STATE_COUNT).padStart(2, "0")}
              </span>
              <div className="mt-5 overflow-hidden">
                <img
                  src={panel.src}
                  alt={panel.alt}
                  loading="lazy"
                  className="img-tone aspect-[3/4] w-full object-contain"
                />
              </div>
              <p className="mt-6 font-display text-[1.35rem] font-light leading-[1.32] tracking-[-0.01em]">
                {panel.state.parts.map((part, pi) => (
                  <span
                    key={`${panel.state.id}-${pi}`}
                    className={part.tone === "strong" ? "text-fg" : "text-fg/38"}
                  >
                    {part.text}
                  </span>
                ))}
              </p>
            </article>
          ))}
        </div>
      </div>

      {/* Desktop — orbital stage */}
      <div
        ref={stage}
        className="relative hidden h-dvh min-h-dvh w-full items-center justify-center overflow-hidden px-[2vw] md:flex"
      >
        <div className="pointer-events-none absolute left-[2.5vw] top-[max(2.5rem,6vh)] z-20">
          <span className="meta text-fg/50">N°04 — Anatomy</span>
          <div className="mt-4 flex items-baseline gap-1 font-display text-5xl font-light leading-none">
            <span ref={counter}>01</span>
            <span className="text-xl text-fg/35">
              / {String(STATE_COUNT).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute right-[2.5vw] top-[max(2.5rem,6vh)] z-20 text-right">
          <span className="meta text-fg/45">OBJ-{STUDY.object.index}</span>
          <p className="mt-4 font-display text-xl font-light leading-snug text-fg/70">
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

          <div className="relative z-10 mx-auto w-[min(38vw,36rem)] lg:w-[min(34vw,40rem)]">
            {STATES.map((state) => (
              <p
                key={state.id}
                data-study-copy
                className="absolute inset-0 flex items-center justify-center text-center font-display text-4xl leading-[1.3] font-light tracking-[-0.01em] lg:text-[2.75rem]"
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
              className="invisible text-center font-display text-4xl leading-[1.3] font-light lg:text-[2.75rem]"
            >
              {STATES[0].parts.map((p) => p.text).join("")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
