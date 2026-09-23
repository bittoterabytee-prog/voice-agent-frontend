import { describe, expect, it, vi } from "vitest";
import { base64ToBlob, playAudioBase64 } from "@/services/audioPlayback";

describe("audioPlayback", () => {
  it("decodes base64 into a blob with the given mime type", async () => {
    const blob = base64ToBlob(btoa("abc"), "audio/mpeg");
    expect(blob.type).toBe("audio/mpeg");
    expect(blob.size).toBe(3);
  });

  it("plays audio and cleans up the object URL", async () => {
    const play = vi.fn(async () => undefined);
    const pause = vi.fn();
    const removeAttribute = vi.fn();
    const listeners = new Map<string, EventListener>();

    vi.stubGlobal(
      "Audio",
      vi.fn(() => ({
        play,
        pause,
        removeAttribute,
        addEventListener: (type: string, listener: EventListener) => {
          listeners.set(type, listener);
        },
      })),
    );

    const createObjectURL = vi.fn(() => "blob:voice-test");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });

    const handle = playAudioBase64(btoa("hi"), "audio/mpeg");
    expect(play).toHaveBeenCalled();

    listeners.get("ended")?.(new Event("ended"));
    await handle.ended;
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:voice-test");

    vi.unstubAllGlobals();
  });
});
