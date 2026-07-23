import { useCallback, useRef } from "react";

const SOUNDS = {
  /** Short futuristic negative/error blip — use on failed actions, rejections, or errors */
  error: "/sounds/sound-error.mp3",
  /** Positive bleep — use on successful actions, confirmations, or good news */
  success: "/sounds/sound-success.mp3",
  /** Light digital click — use on button presses or UI interactions */
  click: "/sounds/sound-click.mp3",
  /** Small popping sound (negative pop) — use for minor reveals, popovers, tooltips, or deletions */
  pop: "/sounds/sound-pop.mp3",
  /** Alias for popping sound used on delete actions */
  delete: "/sounds/sound-pop.mp3",
  /** Cartoon bubble ascending pop — use for grand reveals, like Cento finishing a verdict */
  reveal: "/sounds/sound-reveal.mp3",
} as const;

export type SoundName = keyof typeof SOUNDS;

/**
 * useSound — play named UI sounds with a simple `play("success")` call.
 *
 * Audio is loaded lazily on first play and cached for the lifetime of the
 * component. Safe to call on the server (no-ops if window is unavailable).
 *
 * @example
 * const { play } = useSound();
 * <button onClick={() => play("click")}>Click me</button>
 */
export function useSound() {
  const cache = useRef<Partial<Record<SoundName, HTMLAudioElement>>>({});

  const play = useCallback((name: SoundName, volume = 0.5) => {
    if (typeof window === "undefined") return;

    try {
      // Reuse cached instance or create a new one
      if (!cache.current[name]) {
        cache.current[name] = new Audio(SOUNDS[name]);
      }

      const audio = cache.current[name]!;
      audio.volume = Math.max(0, Math.min(1, volume));
      // Rewind if it's already playing so rapid calls feel snappy
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Silently swallow autoplay policy errors — sound is non-critical
      });
    } catch {
      // Silently swallow any other audio errors
    }
  }, []);

  return { play };
}
