import type { JSX } from "react"
import { ThumbsUp, Volume2, ArrowRight } from "lucide-react"

const cardClass =
  "min-h-84 w-full rounded-2xl border border-border bg-card p-6 shadow-sm md:max-w-sm"

export function FlashcardDemo(): JSX.Element {
  return (
    <figure className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center md:flex-row md:items-stretch md:gap-4">
      <figcaption className="sr-only">
        Example flashcard: the Spanish word &ldquo;Gato&rdquo; translates to
        &ldquo;Cat&rdquo;, with a community mnemonic to help you remember it.
      </figcaption>

      <article aria-label="Prompt side" className={cardClass}>
        <header className="flex justify-between text-xs font-semibold tracking-wide text-muted-foreground">
          <span>TRANSLATE TO ENGLISH</span>
          <span className="flex flex-col items-end gap-2">
            <span>SPANISH CORE 1000</span>
            <span className="text-primary">NEW CARD</span>
          </span>
        </header>
        <div className="mt-12 flex flex-col items-center gap-8">
          <p className="text-5xl font-semibold tracking-tight sm:text-6xl">
            Gato
          </p>
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-full bg-secondary text-muted-foreground"
          >
            <Volume2 className="size-4" />
          </span>
        </div>
      </article>

      <span
        aria-hidden="true"
        className="flex shrink-0 flex-col items-center gap-2 py-6 text-xs font-semibold tracking-wide text-muted-foreground md:justify-center md:py-0"
      >
        <span className="flex size-9 items-center justify-center rounded-full border border-border bg-background">
          <ArrowRight className="size-4 rotate-90 md:rotate-0" />
        </span>
        FLIP
      </span>

      <article aria-label="Answer side" className={cardClass}>
        <dl>
          <dt className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-primary">Cat</span>
            <span className="text-sm font-normal text-muted-foreground">
              Noun / Masc.
            </span>
          </dt>
          <dd className="mt-1 text-sm text-muted-foreground">
            /&apos;ɡa.to/ · noun
          </dd>
          <dd className="mt-3 text-sm">
            A small domesticated carnivorous mammal with soft fur.
          </dd>
        </dl>

        <figure className="mt-8">
          <figcaption className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground">
              <ThumbsUp className="size-3.5" aria-hidden="true" />
              COMMUNITY MNEMONIC
            </span>
            <span className="text-xs text-muted-foreground">1,240 upvotes</span>
          </figcaption>
          <div className="mt-4 flex flex-col items-center gap-5">
            <div
              role="img"
              aria-label="A cat wearing a top hat"
              className="flex h-24 w-full shrink-0 items-center justify-center rounded-xl bg-primary/10 text-4xl"
            >
              🐱 🎩
            </div>
            <blockquote className="text-center text-sm italic">
              &ldquo;Imagine a <span className="font-semibold">Cat</span>-o
              wearing a fancy hat at a Gala. <br />
              <span className="font-semibold">Gato</span> = Gala-Cat.&rdquo;
            </blockquote>
          </div>
        </figure>
      </article>
    </figure>
  )
}
