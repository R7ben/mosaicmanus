import { useEffect } from "react";
import { useLocation } from "wouter";
import { BarChart3, BookOpenCheck, Grid2X2, Plus, ScanLine, SlidersHorizontal, UsersRound, Wifi } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export type PaletteClass = { id: string; name: string; subject?: string | null; yearLevel?: string | null };
export type PaletteStudent = { id: string; name: string };

export type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: PaletteClass[];
  students: PaletteStudent[];
  onSelectClass: (klass: PaletteClass) => void;
  onSelectStudent: (student: PaletteStudent) => void;
  onSelectView: (view: string) => void;
  onCreateClass: () => void;
  onScanSlips: () => void;
};

const views = [
  { view: "overview", label: "Dashboard", icon: Grid2X2 },
  { view: "content", label: "Content workspace", icon: BookOpenCheck },
  { view: "cohort", label: "Students · cohort map", icon: UsersRound },
  { view: "groups", label: "Learning groups", icon: BookOpenCheck },
  { view: "heatmap", label: "Gap Map · concept signals", icon: BarChart3 },
  { view: "settings", label: "Settings", icon: SlidersHorizontal },
];

/** Hooks ⌘K / Ctrl+K to toggle the palette. */
export function useCommandPaletteShortcut(onOpenChange: (open: boolean) => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      onOpenChange(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange]);
}

export default function CommandPalette({
  open,
  onOpenChange,
  classes,
  students,
  onSelectClass,
  onSelectStudent,
  onSelectView,
  onCreateClass,
  onScanSlips,
}: CommandPaletteProps) {
  const [, navigate] = useLocation();
  const run = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search Mosaic Classroom"
      description="Jump to a class, feature, student, or quick action."
    >
      <CommandInput placeholder="Search classes, features, students…" />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>

        {classes.length > 0 && (
          <CommandGroup heading="Classes">
            {classes.map((klass) => (
              <CommandItem
                key={klass.id}
                value={`class ${klass.name} ${klass.subject ?? ""}`}
                onSelect={() => run(() => onSelectClass(klass))}
              >
                <UsersRound />
                <span>{klass.name}</span>
                {klass.subject && <span className="text-muted-foreground ml-auto text-xs">{klass.subject}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="Features">
          {views.map(({ view, label, icon: Icon }) => (
            <CommandItem key={view} value={`feature ${label}`} onSelect={() => run(() => onSelectView(view))}>
              <Icon />
              <span>{label}</span>
            </CommandItem>
          ))}
          <CommandItem value="feature quiz library" onSelect={() => run(() => navigate("/teacher/quiz"))}>
            <BookOpenCheck />
            <span>Quiz Library</span>
          </CommandItem>
          <CommandItem value="feature kiosk shared device" onSelect={() => run(() => navigate("/kiosk"))}>
            <Wifi />
            <span>Kiosk mode</span>
          </CommandItem>
        </CommandGroup>

        {students.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Students">
              {students.slice(0, 8).map((student) => (
                <CommandItem
                  key={student.id}
                  value={`student ${student.name}`}
                  onSelect={() => run(() => onSelectStudent(student))}
                >
                  <UsersRound />
                  <span>{student.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          <CommandItem value="action new class" onSelect={() => run(onCreateClass)}>
            <Plus />
            <span>New class</span>
          </CommandItem>
          <CommandItem value="action create quiz" onSelect={() => run(() => navigate("/teacher/quiz/create"))}>
            <Plus />
            <span>Create quiz</span>
          </CommandItem>
          <CommandItem value="action scan paper slips" onSelect={() => run(onScanSlips)}>
            <ScanLine />
            <span>Scan paper slips</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
