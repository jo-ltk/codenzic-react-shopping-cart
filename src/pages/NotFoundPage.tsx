import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { MagneticButton } from "@/components/MagneticButton";
import { Footer } from "@/sections/Footer";
import { THEME } from "@/lib/motion";
import { useEffect } from "react";

/**
 * In-app 404 — shown for unknown client routes after Vercel rewrites to index.html.
 * Without vercel.json rewrites, Vercel would serve its own NOT_FOUND page instead.
 */
export function NotFoundPage() {
  useEffect(() => {
    document.documentElement.style.setProperty("--bg", THEME.paper.bg);
    document.documentElement.style.setProperty("--fg", THEME.paper.fg);
  }, []);

  return (
    <>
      <main className="px-5 pt-[calc(var(--nav-h,4.5rem)+4rem)] pb-24 md:px-10 md:pb-32">
        <div className="mx-auto max-w-2xl text-center">
          <span className="meta text-fg/45">404 — Not found</span>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] font-light md:text-7xl">
            This page is not
            <br />
            <em className="text-accent">in the issue.</em>
          </h1>
          <p className="mx-auto mt-8 max-w-md text-[0.95rem] leading-[1.75] text-fg/65">
            The address may be mistyped, or the object has left the catalogue.
            Return home or open the current issue.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton className="meta text-fg" to="/catalogue">
              <span className="flex items-center gap-2">
                Enter the catalogue
                <ArrowUpRight className="size-4" strokeWidth={1.5} />
              </span>
            </MagneticButton>
            <Link
              to="/"
              data-cursor=""
              className="meta inline-flex min-h-12 items-center gap-2 border border-fg/20 px-7 py-3.5 text-fg transition-colors duration-500 hover:border-accent hover:text-accent"
            >
              Back home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
