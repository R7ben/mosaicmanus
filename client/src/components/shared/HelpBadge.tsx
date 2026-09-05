import { CircleHelp } from "lucide-react";
import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// A small "?" badge for a feature heading. Hovering it shows a longer,
// how-to-use explanation — more detail than FeatureTooltip's one-line label,
// without needing to open the full "How it works" tutorial.
export default function HelpBadge({ children }: { children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="help-badge"
          aria-label="How to use this feature"
          onClick={(event) => event.preventDefault()}
        >
          <CircleHelp size={13} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={7} className="w-64 text-left whitespace-normal leading-relaxed">
        {children}
      </TooltipContent>
    </Tooltip>
  );
}
