import { Link } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"
import { SiteFooterNav } from "@/components/site-footer-nav"

export function Footer() {
  return (
    <footer className="bg-brand-charcoal text-brand-surface">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to stop forgetting?
          </h2>
          <p className="mt-3 max-w-md text-brand-slate">
            Join other language learners optimizing their brains and learning
            with Memli.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button render={<Link to="/signin" />} nativeButton={false}>
              Start Learning Free
            </Button>
            <Button
              variant="outline"
              render={<Link to="/community" />}
              nativeButton={false}
              className="border-brand-slate bg-transparent text-brand-surface hover:bg-white/10 hover:text-white"
            >
              Explore Community
            </Button>
          </div>
        </div>

        <div className="mt-12">
          <SiteFooterNav tone="onDark" />
        </div>
      </div>
    </footer>
  )
}
