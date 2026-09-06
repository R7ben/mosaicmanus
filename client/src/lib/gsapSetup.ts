import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Registered once per app, at import time — importing this module from
// main.tsx (the app entry) is enough; every other file that needs GSAP
// imports { gsap } directly and relies on this having already run.
gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger };
