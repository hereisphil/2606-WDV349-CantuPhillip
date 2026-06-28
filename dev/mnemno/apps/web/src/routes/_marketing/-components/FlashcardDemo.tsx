import { ThumbsUp, Volume2 } from "lucide-react"

export function FlashcardDemo() {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex items-center justify-between text-xs font-semibold tracking-wide text-muted-foreground">
          <span>SPANISH CORE 1000</span>
          <span className="text-primary">NEW CARD</span>
        </div>
        <div className="mt-6 flex flex-col items-center">
          <span className="text-5xl font-extrabold">Gato</span>
          <span className="mt-4 flex size-9 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Volume2 className="size-4" />
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-primary">Cat</span>
          <span className="text-sm text-muted-foreground">Noun / Masc.</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">/ˈɡa.to/ · noun</p>
        <p className="mt-3 text-sm">
          A small domesticated carnivorous mammal with soft fur.
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground">
            <ThumbsUp className="size-3.5" />
            COMMUNITY MNEMONIC
          </span>
          <span className="text-xs text-muted-foreground">1,240 upvotes</span>
        </div>
        <div className="mt-4 flex gap-4">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-3xl">
            🐱
          </div>
          <div>
            <p className="text-sm italic">
              &ldquo;Imagine a Gato (Cat) wearing a giant sombrero at a Gala.
              Gato = Gala-Cat.&rdquo;
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                Visual Hook
              </span>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Story Method
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
