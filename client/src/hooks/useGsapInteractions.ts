import { useEffect } from "react";
import { gsap } from "@/lib/gsapSetup";

// Elements that get the gentle press/hover scale — buttons, nav items, the
// role picker tiles, topbar actions. One delegated listener on `document`
// covers every element matching these selectors for the life of the app,
// including ones that mount later (dashboards, modals), so nothing needs
// its own ref.
const PRESSABLE = "button, .btn, a.btn, .nav-item, .entry-role, .topbar-action";
// Elements that get the 2px lift instead — glass cards and panels.
const LIFTABLE = ".panel, .summary-card, .quiz-hub-card, .workspace-card, .entry-card, article.settings-row, .option-card";
// Live indicators that pulse in a slow loop while they're in the DOM.
const PULSING = '.status-pill--live, .topbar-action--live, [data-live="true"], .live-dot, .notification-dot';

/**
 * Mounted once (see App.tsx). Drives the interface's interaction motion
 * with GSAP instead of CSS `:hover`/`:active` — a short scale tween on
 * buttons, a lift + shadow-deepen on cards, and a slow looping opacity
 * pulse on "live" badges — matching the design spec's exact easing and
 * durations. Everything is dropped to an instant `gsap.set` under
 * prefers-reduced-motion via `gsap.matchMedia()`.
 */
export function useGsapInteractions() {
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      { reduced: "(prefers-reduced-motion: reduce)", full: "(prefers-reduced-motion: no-preference)" },
      (context) => {
        const { reduced } = context.conditions as { reduced: boolean };

        // Delegation helper: `pointerover`/`pointerout` bubble (unlike
        // pointerenter/pointerleave), so one listener on `document` covers
        // every match, including elements that mount later. The
        // relatedTarget containment check is what makes this behave like a
        // real hover — without it, crossing into a nested icon/span would
        // spuriously fire "leave" on the button that still contains it.
        const delegate = (
          type: "pointerover" | "pointerout" | "pointerdown" | "pointerup",
          selector: string,
          enterExit: "enter" | "exit" | null,
          handler: (target: HTMLElement) => void,
        ) => {
          const listener = (event: PointerEvent) => {
            const target = (event.target as HTMLElement)?.closest?.(selector) as HTMLElement | null;
            if (!target) return;
            if (enterExit) {
              const related = event.relatedTarget as Node | null;
              if (related && target.contains(related)) return; // moved within the same target
            }
            handler(target);
          };
          document.addEventListener(type, listener, true);
          return () => document.removeEventListener(type, listener, true);
        };

        const tween = (target: HTMLElement, vars: gsap.TweenVars) =>
          gsap.to(target, reduced ? { ...vars, duration: 0 } : { duration: 0.18, ease: "power1.out", overwrite: "auto", ...vars });

        const removers = [
          // --- Buttons: scale 1.03 on hover, 0.97 on press ------------------
          delegate("pointerover", PRESSABLE, "enter", (el) => tween(el, { scale: 1.03 })),
          delegate("pointerout", PRESSABLE, "exit", (el) => tween(el, { scale: 1 })),
          delegate("pointerdown", PRESSABLE, null, (el) => tween(el, { scale: 0.97 })),
          delegate("pointerup", PRESSABLE, null, (el) => tween(el, { scale: 1.03 })),
          // --- Cards / panels: 2px lift on hover ----------------------------
          delegate("pointerover", LIFTABLE, "enter", (el) => {
            el.classList.add("gsap-card-hover");
            gsap.to(el, reduced ? { duration: 0, y: -2 } : { y: -2, duration: 0.22, ease: "power1.out", overwrite: "auto" });
          }),
          delegate("pointerout", LIFTABLE, "exit", (el) => {
            el.classList.remove("gsap-card-hover");
            gsap.to(el, reduced ? { duration: 0, y: 0 } : { y: 0, duration: 0.22, ease: "power1.out", overwrite: "auto" });
          }),
        ];

        // --- Live badges: slow looping pulse -------------------------------
        // New badges can appear after mount (a pulse check going live, the
        // live-session overlay), so a MutationObserver keeps picking them up
        // rather than only scanning once.
        const animated = new WeakSet<Element>();
        const pulseTweens: gsap.core.Tween[] = [];
        const maybeAnimate = (el: Element) => {
          if (animated.has(el)) return;
          animated.add(el);
          if (reduced) return;
          pulseTweens.push(gsap.to(el, { opacity: 0.45, repeat: -1, yoyo: true, duration: 1.4, ease: "sine.inOut" }));
        };
        const animatePulsers = (root: ParentNode) => root.querySelectorAll(PULSING).forEach(maybeAnimate);
        animatePulsers(document);
        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            mutation.addedNodes.forEach((node) => {
              if (!(node instanceof Element)) return;
              if (node.matches(PULSING)) maybeAnimate(node);
              animatePulsers(node);
            });
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
          removers.forEach((remove) => remove());
          observer.disconnect();
          pulseTweens.forEach((t) => t.kill());
        };
      },
    );

    return () => mm.revert();
  }, []);
}
