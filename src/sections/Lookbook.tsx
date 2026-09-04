import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/motion";
import { LOOKBOOK } from "@/lib/data";
import { ScrubWords } from "@/components/ScrubWords";

type Note = (typeof LOOKBOOK)[number];

type PieceMetric = {
  piece: HTMLElement;
  frame: HTMLElement | null;
  img: HTMLElement | null;
  caption: HTMLElement | null;
  left: number;
  top: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  speed: number;
};

type PieceTarget = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  midX: number;
  midY: number;
  midScale: number;
  midRotation: number;
  zIndex: number;
};

type AssemblyOpts = {
  /** How aggressively empty space collapses (0–1). */
  contract: number;
  /** Extra scale toward the collage focal plane. */
  scaleBoost: number;
  /** Multiplier on layout-derived rotations. */
  rotAmp: number;
  /** Pin distance as a multiple of board height. */
  pinMultiplier: number;
  /** Quote fade strength while pieces assemble. */
  quoteFade: number;
};

function Frame({ note, className = "" }: { note: Note; className?: string }) {
  return (
    <figure data-lookbook-piece className={`will-change-transform ${className}`.trim()}>
      <div
        data-lookbook-frame
        data-lookbook-speed={note.speed}
        className="overflow-hidden"
      >
        <img
          data-lookbook-img
          src={note.src}
          alt={note.caption}
          loading="lazy"
          className="img-tone w-full object-cover will-change-transform"
        />
      </div>
      <figcaption data-lookbook-caption className="meta mt-4 text-fg/50">
        {note.caption}
      </figcaption>
    </figure>
  );
}

function measurePieces(board: HTMLElement, pieces: HTMLElement[]): PieceMetric[] {
  const boardRect = board.getBoundingClientRect();
  return pieces.map((piece) => {
    const r = piece.getBoundingClientRect();
    const frame = piece.querySelector<HTMLElement>("[data-lookbook-frame]");
    const speed = Number(frame?.dataset.lookbookSpeed ?? 0.12);
    return {
      piece,
      frame,
      img: piece.querySelector<HTMLElement>("[data-lookbook-img]"),
      caption: piece.querySelector<HTMLElement>("[data-lookbook-caption]"),
      left: r.left - boardRect.left,
      top: r.top - boardRect.top,
      width: r.width,
      height: r.height,
      cx: r.left - boardRect.left + r.width / 2,
      cy: r.top - boardRect.top + r.height / 2,
      speed,
    };
  });
}

/** Derive a unique packed collage from the live scattered layout — no shared generic tween. */
function composeTargets(metrics: PieceMetric[], opts: AssemblyOpts): PieceTarget[] {
  const minX = Math.min(...metrics.map((m) => m.left));
  const maxX = Math.max(...metrics.map((m) => m.left + m.width));
  const minY = Math.min(...metrics.map((m) => m.top));
  const maxY = Math.max(...metrics.map((m) => m.top + m.height));
  const boundsCx = (minX + maxX) / 2;
  const boundsCy = (minY + maxY) / 2;
  const boundsW = Math.max(maxX - minX, 1);
  const boundsH = Math.max(maxY - minY, 1);

  const frameW = boundsW * (1 - opts.contract * 0.58);
  const frameH = boundsH * (1 - opts.contract * 0.64);

  const area = metrics.map((m) => m.width * m.height);
  const maxArea = Math.max(...area);

  return metrics.map((m, i) => {
    const nx = (m.cx - boundsCx) / (boundsW / 2);
    const ny = (m.cy - boundsCy) / (boundsH / 2);
    const radial = Math.min(1, Math.hypot(nx, ny));
    const sizeWeight = area[i] / maxArea;

    // Larger plates hold the plane; outer plates scale up slightly as they dock.
    const scale =
      1 +
      opts.scaleBoost * (0.45 + sizeWeight * 0.35 + (1 - radial) * 0.22) +
      Math.abs(m.speed) * 0.35;

    const targetCx = boundsCx + nx * (frameW / 2) * (0.78 + sizeWeight * 0.12);
    const targetCy = boundsCy + ny * (frameH / 2) * (0.74 + sizeWeight * 0.1);

    const x = targetCx - m.cx;
    const y = targetCy - m.cy;

    const rotation =
      (nx * -4.2 + ny * 3.1 + m.speed * 18 + (sizeWeight - 0.5) * 2.4) * opts.rotAmp;

    // Mid-path: overshoot inward + twist before settling into the collage.
    const midX = x * (0.62 + radial * 0.12);
    const midY = y * (0.5 + radial * 0.16) - (1 - radial) * 18 * opts.contract;
    const midScale = scale * (0.92 + radial * 0.04);
    const midRotation = rotation * (1.35 + Math.abs(m.speed) * 0.8);

    const zIndex = Math.round(12 + sizeWeight * 24 + Math.abs(m.speed) * 40 - radial * 6);

    return { x, y, scale, rotation, midX, midY, midScale, midRotation, zIndex };
  });
}

function setupPuzzleAssembly(stage: HTMLElement, opts: AssemblyOpts) {
  const board = stage.querySelector<HTMLElement>("[data-lookbook-board]");
  if (!board) return () => undefined;

  const pieces = gsap.utils.toArray<HTMLElement>("[data-lookbook-piece]", board);
  if (!pieces.length) return () => undefined;

  const quote = stage.querySelector<HTMLElement>("[data-lookbook-quote]");

  const pack = { targets: [] as PieceTarget[] };

  const remasure = () => {
    pack.targets = composeTargets(measurePieces(board, pieces), opts);
    pieces.forEach((piece, i) => {
      piece.style.zIndex = String(pack.targets[i]?.zIndex ?? 1);
    });
  };

  const onRefreshInit = () => {
    gsap.set(pieces, { x: 0, y: 0, scale: 1, rotation: 0 });
    if (quote) gsap.set(quote, { clearProps: "transform,opacity,visibility" });
  };

  ScrollTrigger.addEventListener("refreshInit", onRefreshInit);
  remasure();

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: stage,
      start: "top top",
      end: () => `+=${Math.round(board.offsetHeight * opts.pinMultiplier)}`,
      pin: true,
      scrub: 1.2,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefresh: remasure,
    },
  });

  pieces.forEach((piece, i) => {
    const frame = piece.querySelector<HTMLElement>("[data-lookbook-frame]");
    const img = piece.querySelector<HTMLElement>("[data-lookbook-img]");
    const caption = piece.querySelector<HTMLElement>("[data-lookbook-caption]");
    const speed = Number(frame?.dataset.lookbookSpeed ?? 0.12);
    const stagger = i * 0.045;

    // Phase 1 — converge with organic twist
    tl.to(
      piece,
      {
        x: () => pack.targets[i].midX,
        y: () => pack.targets[i].midY,
        scale: () => pack.targets[i].midScale,
        rotation: () => pack.targets[i].midRotation,
        duration: 0.55,
      },
      stagger,
    );

    // Phase 2 — settle into the calculated collage slot
    tl.to(
      piece,
      {
        x: () => pack.targets[i].x,
        y: () => pack.targets[i].y,
        scale: () => pack.targets[i].scale,
        rotation: () => pack.targets[i].rotation,
        duration: 0.45,
      },
      stagger + 0.55,
    );

    if (frame) {
      tl.fromTo(
        frame,
        { clipPath: "inset(10% 7% 10% 7%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9 },
        stagger,
      );
    }

    if (img) {
      tl.fromTo(
        img,
        { scale: 1.2 + Math.abs(speed) * 0.35, yPercent: speed * -55 },
        { scale: 1.04, yPercent: speed * 28, duration: 1 },
        stagger,
      );
    }

    if (caption) {
      tl.fromTo(
        caption,
        { y: 18, autoAlpha: 0.35 },
        { y: -6, autoAlpha: 0.85, duration: 0.7 },
        stagger + 0.2,
      );
    }
  });

  if (quote) {
    tl.to(
      quote,
      {
        autoAlpha: 1 - opts.quoteFade,
        y: -28 * opts.quoteFade,
        scale: 1 - 0.04 * opts.quoteFade,
        duration: 0.55,
      },
      0.08,
    );
  }

  const imgs = board.querySelectorAll("img");
  const onImg = () => ScrollTrigger.refresh();
  imgs.forEach((img) => {
    if (!img.complete) img.addEventListener("load", onImg, { once: true });
  });

  return () => {
    ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
    imgs.forEach((img) => img.removeEventListener("load", onImg));
    tl.scrollTrigger?.kill();
    tl.kill();
    gsap.set(pieces, { clearProps: "transform,zIndex" });
  };
}

/** "Field Notes" — scattered plates assemble into one editorial collage on scrub. */
export function Lookbook() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const intro = root.current?.querySelector<HTMLElement>("[data-lookbook-intro]");
      if (intro) {
        gsap.from(intro, {
          y: 48,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: intro, start: "top 85%", once: true },
        });
      }

      const quote = root.current?.querySelector<HTMLElement>("[data-lookbook-quote]");
      if (quote && prefersReducedMotion()) {
        gsap.from(quote, {
          y: 40,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: quote, start: "top 88%", once: true },
        });
      }

      if (prefersReducedMotion()) {
        gsap.utils.toArray<HTMLElement>("[data-lookbook-frame]", root.current).forEach((frame) => {
          gsap.fromTo(
            frame,
            { clipPath: "inset(12% 8% 12% 8%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              ease: "none",
              scrollTrigger: {
                trigger: frame,
                start: "top 90%",
                end: "top 35%",
                scrub: 0.8,
              },
            },
          );
        });
        return;
      }

      const stage = root.current?.querySelector<HTMLElement>("[data-lookbook-stage]");
      if (!stage) return;

      const mm = gsap.matchMedia();

      // Desktop — full puzzle / collage (Tailwind `md`)
      mm.add("(min-width: 768px)", () =>
        setupPuzzleAssembly(stage, {
          contract: 0.72,
          scaleBoost: 0.14,
          rotAmp: 1,
          pinMultiplier: 1.55,
          quoteFade: 0.82,
        }),
      );

      // Mobile — simplified pack (below Tailwind `md`)
      mm.add("(max-width: 767px)", () =>
        setupPuzzleAssembly(stage, {
          contract: 0.42,
          scaleBoost: 0.06,
          rotAmp: 0.45,
          pinMultiplier: 1.15,
          quoteFade: 0.45,
        }),
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  const [sofa, lamp, chair, table, mirror, vessel] = LOOKBOOK;

  return (
    <section
      ref={root}
      id="index"
      data-theme="paper"
      className="relative overflow-x-clip px-5 py-32 md:px-10 md:py-48"
    >
      <div data-lookbook-intro className="mb-20 md:mb-32">
        <span className="meta text-fg/50">N°05 — Field Notes</span>
        <h2 className="mt-6 font-display text-5xl leading-[1.05] font-light md:text-7xl">
          Objects, <em className="text-accent">at home.</em>
        </h2>
      </div>

      <div data-lookbook-stage className="relative">
        <div
          data-lookbook-board
          className="flex flex-col gap-16 will-change-transform md:gap-24"
        >
          {/* Cluster A — left stack beside tall lamp */}
          <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-12 md:gap-x-8">
            <div className="flex flex-col gap-10 md:col-span-5 md:gap-12">
              <Frame note={sofa} />
              <Frame note={chair} className="md:w-[88%] md:self-end" />
            </div>
            <Frame note={lamp} className="md:col-span-5 md:col-start-8 md:mt-28" />
          </div>

          <div data-lookbook-quote className="md:mx-auto md:max-w-3xl md:py-8">
            <ScrubWords
              text="“A good object does not ask for attention. It earns familiarity — the way a doorknob earns the shape of a hand.”"
              accents={["familiarity"]}
              className="font-display text-2xl leading-[1.35] font-light md:text-4xl"
            />
            <span className="meta mt-6 block text-fg/50">— From the Issue 04 editor's note</span>
          </div>

          {/* Cluster B — left stack beside tall mirror */}
          <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-12 md:gap-x-8">
            <div className="flex flex-col gap-10 md:col-span-5 md:col-start-1 md:gap-12">
              <Frame note={table} className="md:w-[90%] md:self-end" />
              <Frame note={vessel} className="md:w-[78%]" />
            </div>
            <Frame note={mirror} className="md:col-span-6 md:col-start-7 md:mt-16" />
          </div>
        </div>
      </div>
    </section>
  );
}
