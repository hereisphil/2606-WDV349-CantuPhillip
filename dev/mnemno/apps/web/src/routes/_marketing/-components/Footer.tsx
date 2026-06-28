import { Link } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"

const footerLinkClass =
  "text-sm font-medium text-brand-slate transition-colors hover:text-white"

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
            with Mnemno.
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

        <nav className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <Link to="/" className={footerLinkClass}>
            Home
          </Link>
          <Link to="/" hash="features" className={footerLinkClass}>
            Features
          </Link>
          <Link to="/about" className={footerLinkClass}>
            About
          </Link>
          <Link to="/contact" className={footerLinkClass}>
            Contact
          </Link>
          <Link to="/blog" className={footerLinkClass}>
            Blog
          </Link>
          <Link to="/" hash="why-mnemonics" className={footerLinkClass}>
            Why Mnemonics?
          </Link>
          <Link to="/pricing" className={footerLinkClass}>
            Pricing
          </Link>
          <Link to="/terms" className={footerLinkClass}>
            Terms of Service
          </Link>
          <Link to="/privacy" className={footerLinkClass}>
            Privacy Policy
          </Link>
        </nav>

        <p className="mt-8 text-center text-sm text-brand-slate">
          &copy; 2026 Mnemno. Learn faster, remember forever.
        </p>
      </div>
    </footer>
  )
}
