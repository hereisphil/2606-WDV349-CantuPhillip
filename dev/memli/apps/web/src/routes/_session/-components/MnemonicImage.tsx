import { useCallback, useState, type JSX } from "react"
import { cn } from "@workspace/ui/lib/utils"
import type { Mnemonic } from "./study-cards"

type ImageStatus = "loading" | "loaded" | "failed"

type MnemonicImageProps = {
  image: Mnemonic["image"]
  /** The card's term, drawn in the fallback when there is no picture. */
  term: string
  /** BCP 47 tag of `term`. */
  learningLanguage: string
  /** BCP 47 tag of the image's alt text: the mnemonic's `contentLocale`. */
  imageLanguage: string
  className?: string
}

/**
 * The mnemonic's picture in a fixed 4:3 frame, so the story beside it
 * doesn't jump while it loads. Any picture fits by cropping, never by
 * stretching. With no picture, or one that fails to load, the frame shows
 * the term instead, so the layout stays the same.
 *
 * Remount it with a `key` when the picture changes, so the status resets.
 */
export function MnemonicImage({
  image,
  term,
  learningLanguage,
  imageLanguage,
  className,
}: MnemonicImageProps): JSX.Element {
  // One value with three states, not `isLoaded` + `hasError` (docs/state-management.md).
  const [status, setStatus] = useState<ImageStatus>(
    image === undefined ? "failed" : "loading"
  )
  // A cached image can finish before React attaches `onLoad`; settle it here so it doesn't stay hidden.
  const settleIfComplete = useCallback((element: HTMLImageElement | null) => {
    if (element?.complete === true) {
      setStatus(element.naturalWidth > 0 ? "loaded" : "failed")
    }
  }, [])

  return (
    <div
      className={cn(
        "relative aspect-4/3 w-full overflow-hidden rounded-lg bg-muted",
        className
      )}
    >
      {status === "failed" || image === undefined ? (
        // Decorative: the term is already on the card, and there is no picture to describe.
        <div
          aria-hidden="true"
          className="flex size-full items-center justify-center bg-primary/10 p-4"
        >
          <span
            lang={learningLanguage}
            className="line-clamp-3 text-center font-heading text-3xl font-bold tracking-tight wrap-break-word text-primary"
          >
            {term}
          </span>
        </div>
      ) : (
        <>
          {status === "loading" ? (
            <div className="absolute inset-0 animate-pulse bg-muted motion-reduce:animate-none" />
          ) : null}
          <img
            ref={settleIfComplete}
            src={image.src}
            alt={image.alt}
            lang={imageLanguage}
            decoding="async"
            onLoad={() => {
              setStatus("loaded")
            }}
            onError={() => {
              setStatus("failed")
            }}
            className={cn(
              "size-full object-cover transition-opacity duration-300 motion-reduce:transition-none",
              status === "loaded" ? "opacity-100" : "opacity-0"
            )}
          />
        </>
      )}
    </div>
  )
}
