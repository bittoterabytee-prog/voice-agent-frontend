/**
 * Browser TTS playback helpers for KAN-16 (audioBase64 from POST /api/voice/turn).
 */

export function base64ToBlob(audioBase64: string, mimeType: string): Blob {
  const trimmed = audioBase64.trim();
  const payload = trimmed.includes(",") ? trimmed.slice(trimmed.indexOf(",") + 1) : trimmed;
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType || "audio/mpeg" });
}

export type PlaybackHandle = {
  stop: () => void;
  readonly ended: Promise<void>;
};

/** Play base64 audio; resolves when playback ends or is stopped. */
export function playAudioBase64(audioBase64: string, mimeType = "audio/mpeg"): PlaybackHandle {
  const blob = base64ToBlob(audioBase64, mimeType);
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);

  let settled = false;
  let resolveEnded!: () => void;
  const ended = new Promise<void>((resolve) => {
    resolveEnded = resolve;
  });

  const finish = () => {
    if (settled) {
      return;
    }
    settled = true;
    URL.revokeObjectURL(url);
    resolveEnded();
  };

  audio.addEventListener("ended", finish);
  audio.addEventListener("error", finish);

  void audio.play().catch(() => {
    finish();
  });

  return {
    stop: () => {
      audio.pause();
      audio.removeAttribute("src");
      finish();
    },
    ended,
  };
}
