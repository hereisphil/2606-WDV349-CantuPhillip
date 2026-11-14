/**
 * Pronunciation through the browser's built-in text-to-speech (Web Speech
 * API). A prototype stand-in until seeded decks ship recorded audio (#112).
 * The voice depends on what the device has installed for `lang`.
 */
export const canPronounce =
  typeof window !== "undefined" && "speechSynthesis" in window

/** Some browsers never fire `start` or `error`, so stop waiting after this. */
const START_TIMEOUT_MS = 3000

/**
 * Reads `text` aloud in `lang` (BCP 47), cutting off anything still playing.
 * Resolves once the audio starts, fails, or {@link START_TIMEOUT_MS} passes,
 * so the UI can show it loading. Recorded audio (#112) keeps this contract
 * by resolving on the `<audio>` element's `playing` event.
 */
export function pronounce(text: string, lang: string): Promise<void> {
  if (!canPronounce) {
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    // A touch slower than the default so learners can hear each sound.
    utterance.rate = 0.85
    utterance.addEventListener("start", () => {
      resolve()
    })
    utterance.addEventListener("error", () => {
      resolve()
    })
    window.setTimeout(resolve, START_TIMEOUT_MS)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  })
}
