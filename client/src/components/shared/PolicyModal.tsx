import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  content: string;
  isOpen: boolean;
  onClose: () => void;
};

// A section heading line is written in the source string as its own,
// all-caps line (e.g. "1. ACCEPTANCE OF TERMS") — everything else renders
// as a body paragraph. See client/src/lib/policies.ts.
function isHeadingLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.length > 0 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
}

export default function PolicyModal({ title, content, isOpen, onClose }: Props) {
  const lines = content.split("\n").filter((line) => line.trim().length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-bold">{title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1 whitespace-pre-line">
          {lines.map((line, index) =>
            isHeadingLine(line) ? (
              <p key={index} className="pt-2 text-xs font-semibold tracking-wide text-gray-500 uppercase [font-variant-caps:small-caps] first:pt-0">
                {line}
              </p>
            ) : (
              <p key={index} className="text-sm leading-relaxed text-gray-700">
                {line}
              </p>
            )
          )}
          <div className="pt-2">
            <span className="inline-block rounded-full bg-green-50 px-3 py-1 text-xs text-green-700">
              ✓ PDPA 2010 Compliant
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
