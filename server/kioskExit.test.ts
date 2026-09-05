import { describe, expect, it } from "vitest";
import { leaveKiosk } from "../client/src/lib/kioskExit";

describe("leaveKiosk", () => {
  it("exits fullscreen before navigating", async () => {
    const events: string[] = [];

    await leaveKiosk({
      hasFullscreen: true,
      exitFullscreen: async () => {
        events.push("exit-fullscreen-start");
        await Promise.resolve();
        events.push("exit-fullscreen-complete");
      },
      navigate: () => events.push("navigate"),
    });

    expect(events).toEqual([
      "exit-fullscreen-start",
      "exit-fullscreen-complete",
      "navigate",
    ]);
  });

  it("still navigates when fullscreen exit is rejected", async () => {
    const events: string[] = [];

    await leaveKiosk({
      hasFullscreen: true,
      exitFullscreen: async () => {
        events.push("exit-fullscreen");
        throw new Error("fullscreen permission denied");
      },
      navigate: () => events.push("navigate"),
    });

    expect(events).toEqual(["exit-fullscreen", "navigate"]);
  });
});
