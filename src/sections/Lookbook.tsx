import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion, isFinePointer } from "@/lib/motion";
import { LOOKBOOK } from "@/lib/data";
import { ScrubWords } from "@/components/ScrubWords";
import { cn } from "@/lib/utils";

type Note = (typeof LOOKBOOK)[number];

function Frame({
  note,
  className = "",
  aspect = "aspect-[3/4]",
  captionClassName = "",
}: {
  note: Note;
  className?: string;
  aspect?: string;
  captionClassName?: string;
}) {
  return (
    <figure data-lookbook-figure className={cn("group", className)}>
      <div
        data-lookbook-frame
        data-lookbook-speed={note.speed}
        className={cn("relative overflow-hidden bg-fg/[0.03]", aspect)}
      >
        <img
          data-lookbook-img
          src={note.src}
          alt={note.caption}
          loading="lazy"
          className="img-tone h-full w-full object-cover will-change-transform"
        />
      </div>
      <figcaption
        data-lookbook-caption
        className={cn(
          "meta mt-4 text-fg/45 transition-colors duration-500 group-hover:text-fg/65",
          captionClassName,
        )}
      >
        {note.caption}
      </figcaption>
    </figure>
  );
}

/**
 * "Field Notes" — two editorial chapters with restrained scroll storytelling.
 * Images keep their natural composition; motion is reveal, depth, and hover only.
 */
export function Lookbook() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const reduced = prefersReducedMotion();

      const intro = root.current?.querySelector<HTMLElement>("[data-lookbook-intro]");
      if (intro) {
        gsap.from(intro.children, {
          y: reduced ? 16 : 40,
          autoAlpha: 0,
          duration: reduced ? 0.45 : 0.95,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: intro, start: "top 82%", once: true },
        });
      }

      gsap.utils.toArray<HTMLElement>("[data-lookbook-chapter]", root.current).forEach((chapter) => {
        const label = chapter.querySelector<HTMLElement>("[data-lookbook-chapter-label]");
        const rule = chapter.querySelector<HTMLElement>("[data-lookbook-chapter-rule]");

        if (label) {
          gsap.from(label.children, {
            y: reduced ? 12 : 28,
            autoAlpha: 0,
            duration: reduced ? 0.4 : 0.85,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: { trigger: label, start: "top 88%", once: true },
          });
        }

        if (rule && !reduced) {
          gsap.fromTo(
            rule,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: "none",
              scrollTrigger: {
                trigger: rule,
                start: "top 90%",
                end: "top 55%",
                scrub: 0.6,
              },
            },
          );
        }
      });

      const quote = root.current?.querySelector<HTMLElement>("[data-lookbook-quote]");
      if (quote) {
        gsap.from(quote, {
          y: reduced ? 16 : 36,
          autoAlpha: 0,
          duration: reduced ? 0.45 : 1,
          ease: "power3.out",
          scrollTrigger: { trigger: quote, start: "top 88%", once: true },
        });
      }

      gsap.utils.toArray<HTMLElement>("[data-lookbook-figure]", root.current).forEach((figure) => {
        const frame = figure.querySelector<HTMLElement>("[data-lookbook-frame]");
        const img = figure.querySelector<HTMLElement>("[data-lookbook-img]");
        const caption = figure.querySelector<HTMLElement>("[data-lookbook-caption]");
        const speed = Number(frame?.dataset.lookbookSpeed ?? 0.12);

        if (!frame) return;

        if (reduced) {
          gsap.from(figure, {
            y: 20,
            autoAlpha: 0,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: { trigger: figure, start: "top 90%", once: true },
          });
          return;
        }

        gsap.fromTo(
          frame,
          { clipPath: "inset(8% 6% 8% 6%)", scale: 1.02 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: frame,
              start: "top 92%",
              end: "top 42%",
              scrub: 0.85,
            },
          },
        );

        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.14, yPercent: speed * -55 },
            {
              scale: 1.04,
              yPercent: speed * 55,
              ease: "none",
              scrollTrigger: {
                trigger: frame,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.15,
              },
            },
          );
        }

        if (caption) {
          gsap.from(caption, {
            y: 18,
            autoAlpha: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: caption, start: "top 96%", once: true },
          });
        }
      });

      if (reduced || !isFinePointer() || !contextSafe) return;

      const cleanups: Array<() => void> = [];

      gsap.utils.toArray<HTMLElement>("[data-lookbook-figure]", root.current).forEach((figure) => {
        const frame = figure.querySelector<HTMLElement>("[data-lookbook-frame]");
        if (!frame) return;

        const onEnter = contextSafe(() => {
          gsap.to(frame, {
            y: -6,
            duration: 1.05,
            ease: "power2.out",
            overwrite: "auto",
          });
        });

        const onLeave = contextSafe(() => {
          gsap.to(frame, {
            y: 0,
            duration: 1.15,
            ease: "power2.out",
            overwrite: "auto",
          });
        });

        figure.addEventListener("pointerenter", onEnter);
        figure.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          figure.removeEventListener("pointerenter", onEnter);
          figure.removeEventListener("pointerleave", onLeave);
        });
      });

      return () => cleanups.forEach((fn) => fn());
    },
    { scope: root },
  );

  const [sofa, lamp, chair, table, mirror, vessel] = LOOKBOOK;

  return (
    <section
      ref={root}
      id="lookbook"
      data-theme="paper"
      className="relative overflow-x-clip px-5 py-28 md:px-10 md:py-44 lg:py-52"
    >
      {/* ── Intro ─────────────────────────────────────────────── */}
      <header
        data-lookbook-intro
        className="mb-24 max-w-3xl md:mb-36 lg:mb-44"
      >
        <span className="meta text-fg/50">N°05 — Field Notes</span>
        <h2 className="mt-6 font-display text-5xl leading-[1.05] font-light tracking-[-0.02em] md:text-7xl lg:text-[5.25rem]">
          Objects, <em className="text-accent">at home.</em>
        </h2>
        <p className="mt-8 max-w-md text-sm leading-relaxed text-fg/55 md:text-base">
          Two rooms, six plates — notes from how the collection settles into
          light, shadow, and the quiet between.
        </p>
      </header>

      <div className="flex flex-col gap-28 md:gap-40 lg:gap-52">
        {/* ── Chapter I — Evening rooms ───────────────────────── */}
        <article data-lookbook-chapter className="relative">
          <div
            data-lookbook-chapter-label
            className="mb-12 flex flex-col gap-5 md:mb-16 md:max-w-xl"
          >
            <div className="flex items-center gap-4">
              <span className="meta text-accent">01</span>
              <span
                data-lookbook-chapter-rule
                className="h-px w-16 origin-left bg-fg/25 md:w-24"
              />
              <span className="meta text-fg/45">Evening rooms</span>
            </div>
            <h3 className="font-display text-3xl leading-tight font-light md:text-4xl lg:text-[2.75rem]">
              Where the day softens
              <span className="text-fg/40"> — velvet, bronze, a low lamp.</span>
            </h3>
          </div>

          {/* Lead plate — sofa, landscape */}
          <Frame
            note={sofa}
            aspect="aspect-[4/5] md:aspect-[16/10]"
            className="w-full md:w-[88%] lg:w-[82%]"
          />

          {/* Support duo — lamp tall + chair */}
          <div className="mt-14 grid grid-cols-1 items-end gap-12 md:mt-20 md:grid-cols-12 md:gap-x-8 lg:mt-28">
            <Frame
              note={lamp}
              aspect="aspect-[3/4]"
              className="md:col-span-5 md:col-start-1 md:mt-8 lg:col-span-4 lg:col-start-2"
            />
            <Frame
              note={chair}
              aspect="aspect-[4/5]"
              className="md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-7"
              captionClassName="md:text-right"
            />
          </div>
        </article>

        {/* ── Bridge quote ────────────────────────────────────── */}
        <aside
          data-lookbook-quote
          className="relative mx-auto max-w-3xl border-y border-fg/10 py-14 md:py-20"
        >
          <ScrubWords
            text="“A good object does not ask for attention. It earns familiarity — the way a doorknob earns the shape of a hand.”"
            accents={["familiarity"]}
            className="font-display text-2xl leading-[1.35] font-light md:text-4xl md:leading-[1.3]"
          />
          <span className="meta mt-8 block text-fg/45">
            — From the Issue 04 editor&apos;s note
          </span>
        </aside>

        {/* ── Chapter II — Morning light ──────────────────────── */}
        <article data-lookbook-chapter className="relative">
          <div
            data-lookbook-chapter-label
            className="mb-12 flex flex-col gap-5 md:mb-16 md:ml-auto md:max-w-xl md:items-end md:text-right"
          >
            <div className="flex items-center gap-4 md:flex-row-reverse">
              <span className="meta text-accent">02</span>
              <span
                data-lookbook-chapter-rule
                className="h-px w-16 origin-left bg-fg/25 md:w-24 md:origin-right"
              />
              <span className="meta text-fg/45">Morning light</span>
            </div>
            <h3 className="font-display text-3xl leading-tight font-light md:text-4xl lg:text-[2.75rem]">
              Quiet surfaces
              <span className="text-fg/40"> — marble, gilt, a held reflection.</span>
            </h3>
          </div>

          {/* Asymmetric: tall mirror + stacked stills */}
          <div className="grid grid-cols-1 items-start gap-14 md:grid-cols-12 md:gap-x-10 lg:gap-x-14">
            <Frame
              note={mirror}
              aspect="aspect-[3/4] md:aspect-[2/3]"
              className="md:col-span-6 md:col-start-1 lg:col-span-5"
            />

            <div className="flex flex-col gap-14 md:col-span-5 md:col-start-8 md:mt-24 md:gap-16 lg:mt-32">
              <Frame
                note={table}
                aspect="aspect-[5/4]"
                className="w-full md:w-[92%] md:self-end"
              />
              <Frame
                note={vessel}
                aspect="aspect-[4/5]"
                className="w-[78%] md:w-[68%] md:self-start"
              />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
