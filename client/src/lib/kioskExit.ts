export type KioskExitDeps = {
  hasFullscreen: boolean;
  exitFullscreen: () => Promise<void> | void;
  navigate: () => void;
};

export async function leaveKiosk({ hasFullscreen, exitFullscreen, navigate }: KioskExitDeps) {
  if (hasFullscreen) {
    try {
      await exitFullscreen();
    } catch {
      // Navigation should still succeed when a browser denies fullscreen exit.
    }
  }
  navigate();
}
