import { useRef, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsapSetup";
import { useGSAP } from "@gsap/react";

type RiseInOptions = {
  /** CSS selector for the children to animate, relative to the container. */
  targets?: string;
  /** Gap between each staggered child, in seconds. */
  stagger?: number;
  /** Vertical travel distance, in px. */
  distance?: number;
  duration?: number;
  ease?: string;
  /**
   * Above-the-fold content (dashboards, hero grids) should animate the
   * moment it mounts. Content further down the page — quiz libraries,
   * long question tables — reveals as the user scrolls to it instead, so
   * it doesn't jump on first paint before it's visible.
   */
  scrollTriggered?: boolean;
  /** Re-run the animation (and refresh ScrollTrigger) when these change. */
  deps?: unknown[];
};

/**
 * Fades and rises a container's children into place — a GSAP timeline
 * with autoAlpha + y, staggered per sibling, replacing the old CSS
 * keyframe/animation-delay approach so entrance motion can react to real
 * data (list length, scroll position) instead of guessing nth-child delays.
 *
 * Respects prefers-reduced-motion via gsap.matchMedia, and cleans up
 * through useGSAP's built-in context revert — no manual ctx.revert() needed.
 */
export function useRiseIn<T extends HTMLElement = HTMLDivElement>(
  options: RiseInOptions = {},
): RefObject<T | null> {
  const {
    targets = ":scope > *",
    stagger = 0.09,
    distance = 16,
    duration = 0.6,
    ease = "power2.out",
    scrollTriggered = false,
    deps = [],
  } = options;

  const containerRef = useRef<T | null>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const children = gsap.utils.toArray<HTMLElement>(targets, containerRef.current);
      if (!children.length) return;

      const mm = gsap.matchMedia();
      mm.add(
        { reduced: "(prefers-reduced-motion: reduce)", full: "(prefers-reduced-motion: no-preference)" },
        (context) => {
          const { reduced } = context.conditions as { reduced: boolean };
          if (reduced) {
            gsap.set(children, { autoAlpha: 1, y: 0 });
            return;
          }

          gsap.set(children, { autoAlpha: 0, y: distance });
          const tl = gsap.timeline({
            defaults: { duration, ease },
            scrollTrigger: scrollTriggered
              ? { trigger: containerRef.current, start: "top 85%", once: true }
              : undefined,
          });
          tl.to(children, { autoAlpha: 1, y: 0, stagger });
        },
      );

      return () => mm.revert();
    },
    { scope: containerRef, dependencies: deps },
  );

  return containerRef;
}

/** Call after content that affects layout settles (e.g. async data arriving
 * below an already-measured ScrollTrigger) so trigger positions stay correct. */
export function refreshScrollTriggers() {
  ScrollTrigger.refresh();
}
