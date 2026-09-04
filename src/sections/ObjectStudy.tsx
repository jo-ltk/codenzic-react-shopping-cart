import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion";
import { STUDY } from "@/lib/data";

/**
 * "Anatomy" — one object taken apart, narratively.
 * Desktop: the stage pins while scroll activates each hotspot dot in turn,
 * crossfading its story on the left. Mobile: a plain annotated list.
 */
export function ObjectStudy() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const steps = STUDY.annotations;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const copies = gsap.utils.toArray<HTMLElement>("[data-study-copy]", stage.current);
        const dots = gsap.utils.toArray<HTMLElement>("[data-hotspot]", stage.current);
        let current = -1;

        const activate = (next: number) => {
          if (next === current) return;
          current = next;

          copies.forEach((el, i) => {
            gsap.to(el, {
              autoAlpha: i === next ? 1 : 0,
              y: i === next ? 0 : 20,
              duration: 0.55,
              ease: "power3.out",
              overwrite: "auto",
            });
          });

          dots.forEach((el, i) => el.classList.toggle("is-active", i === next));

          if (counter.current) {
            counter.current.textContent = String(next + 1).padStart(2, "0");
          }
        };

        gsap.set(copies, { autoAlpha: 0, y: 20 });

        gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: `+=${steps.length * 85}%`,
            pin: stage.current,
            scrub: true,
            onUpdate: (self) => {
              activate(
                Math.min(steps.length - 1, Math.floor(self.progress * steps.length)),
              );
            },
          },
        });

        // ambient ring slowly counter-rotates through the whole study
        gsap.to("[data-study-ring]", {
          rotation: 160,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: `+=${steps.length * 85}%`,
            scrub: true,
          },
        });

        activate(0);
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="anatomy" data-theme="paper" className="relative">
      {/* ---------- desktop pinned stage ---------- */}
      <div ref={stage} className="hidden min-h-dvh grid-cols-12 items-center gap-6 px-10 py-24 md:grid">
        {/* narrative column */}
        <div className="col-span-3">
          <span className="meta text-fg/50">N°04 — Anatomy</span>
          <div className="mt-4 flex items-baseline gap-1 font-display text-5xl font-light">
            <span ref={counter}>01</span>
            <span className="text-xl text-fg/40">/ {String(steps.length).padStart(2, "0")}</span>
          </div>

          <div className="relative mt-10 h-56">
            {steps.map((step) => (
              <div key={step.title} data-study-copy className="absolute inset-0">
                <h3 className="font-display text-2xl font-normal text-accent">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-fg/65">{step.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* stage */}
        <div className="col-span-6 flex justify-center">
          <div className="relative w-[min(30vw,26rem)]">
            <span
              data-study-ring
              aria-hidden
              className="absolute -inset-10 rounded-full border border-dashed border-fg/20"
            />
            <div className="relative overflow-hidden rounded-t-[999px]">
              <img
                src={STUDY.object.img}
                alt={`${STUDY.object.name} — placeholder`}
                className="img-tone aspect-[3/4] w-full object-cover"
              />
            </div>

            {steps.map((step, i) => (
              <button
                key={step.title}
                data-hotspot
                type="button"
                aria-label={step.title}
                className="hotspot absolute z-10 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper shadow-[0_0_0_1.5px_var(--color-ink)]"
                style={{ left: `${step.x}%`, top: `${step.y}%` }}
              >
                <span className="hotspot-label meta absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-[0.55rem] text-paper">
                  {String(i + 1).padStart(2, "0")} — {step.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* object meta */}
        <div className="col-span-3 justify-self-end text-right">
          <span className="meta text-fg/50">OBJ-{STUDY.object.index}</span>
          <h3 className="mt-3 font-display text-3xl font-light">{STUDY.object.name}</h3>
          <p className="meta mt-2 text-fg/50">{STUDY.object.nature}</p>
          <p className="mt-6 font-display text-2xl text-accent">{STUDY.object.price}</p>
        </div>
      </div>

      {/* ---------- mobile fallback ---------- */}
      <div className="px-5 py-24 md:hidden">
        <span className="meta text-fg/50">N°04 — Anatomy</span>
        <h2 className="mt-4 font-display text-4xl font-light">{STUDY.object.name}</h2>
        <p className="mt-3 text-sm text-fg/60">{STUDY.intro}</p>

        <div className="mt-8 overflow-hidden rounded-t-[999px]">
          <img
            src={STUDY.object.img}
            alt={`${STUDY.object.name} — placeholder`}
            loading="lazy"
            className="img-tone aspect-[3/4] w-full object-cover"
          />
        </div>

        <ol className="mt-10 space-y-8">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="dot-pulse mt-1.5 size-2 shrink-0 rounded-full bg-accent" />
              <div>
                <h3 className="font-display text-xl text-accent">
                  {String(i + 1).padStart(2, "0")} — {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-fg/65">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
