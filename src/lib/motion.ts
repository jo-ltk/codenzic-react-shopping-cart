import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Signature entrance ease — soft expo-out. */
export const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
export const EASE_GSAP = [0.22, 1, 0.36, 1] as const;

/** Scroll-morph worlds — hexes stay in lockstep with `global.css` tokens. */
export const THEME = {
  /* Light: warm ivory ground + charcoal text */
  paper: { bg: "#efe9df", fg: "#17140f" },
  /* Dark: hero forest green + ivory text */
  ink: { bg: "#0a1610", fg: "#efe9df" },
} as const;

export type ThemeName = keyof typeof THEME;

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isFinePointer = () => window.matchMedia("(pointer: fine)").matches;

export { gsap, ScrollTrigger, useGSAP };
