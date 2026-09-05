import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Props = { label: string; children: ReactNode; side?: "top" | "right" | "bottom" | "left" };

export default function FeatureTooltip({ label, children, side = "top" }: Props) {
  return <Tooltip><TooltipTrigger asChild>{children}</TooltipTrigger><TooltipContent side={side} sideOffset={7} className="feature-tooltip">{label}</TooltipContent></Tooltip>;
}
