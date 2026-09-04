import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { gsap, prefersReducedMotion, THEME, useGSAP } from "@/lib/motion";
import {
  fetchProductById,
  ProductNotFoundError,
  productQueryKey,
  productsQueryKey,
  type Product,
} from "@/lib/api/products";
import { ProductDetails } from "@/components/products/ProductDetails";
import { ProductError } from "@/components/products/ProductError";
import { EditorialState } from "@/components/EditorialState";
import { Footer } from "@/sections/Footer";
import { ui } from "@/lib/ui";

function parseProductId(value: string | undefined) {
  if (!value || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function BackToObjects() {
  return (
    <Link
      to="/catalogue"
      data-cursor=""
      className="meta inline-flex items-center gap-2 text-fg/55 transition-colors duration-300 hover:text-accent"
    >
      <ArrowLeft className="size-3.5" strokeWidth={1.5} />
      Back to Objects
    </Link>
  );
}

function ProductStudySkeleton() {
  return (
    <div aria-hidden className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
      <div className="aspect-[3/4] w-full animate-pulse border border-fg/10 bg-fg/[0.05]" />
      <div className="animate-pulse space-y-5 md:pt-2">
        <div className="h-2 w-24 bg-fg/10" />
        <div className="h-12 w-4/5 max-w-sm bg-fg/[0.08]" />
        <div className="h-2 w-32 bg-fg/10" />
        <div className="h-8 w-28 bg-fg/[0.08]" />
        <div className="space-y-2 pt-4">
          <div className="h-3 w-full bg-fg/10" />
          <div className="h-3 w-5/6 bg-fg/10" />
          <div className="h-3 w-2/3 bg-fg/10" />
        </div>
        <div className="mt-8 h-12 w-full border border-fg/10 bg-fg/[0.03]" />
      </div>
    </div>
  );
}

function ProductMissing() {
  return (
    <EditorialState
      eyebrow="Not found"
      accent
      title="This object is no longer in the issue."
      body="It may have left the catalogue, or the link is incomplete."
      action={
        <Link to="/catalogue" data-cursor="" className={ui.btnGhostTheme}>
          Back to Objects
        </Link>
      }
    />
  );
}

/**
 * Dedicated object page at /catalogue/:productId.
 * Fetches by id through TanStack Query + Zod — product data is never stored in Zustand.
 */
export function ProductPage() {
  const root = useRef<HTMLElement>(null);
  const { productId } = useParams();
  const id = parseProductId(productId);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: productQueryKey(id ?? 0),
    queryFn: () => fetchProductById(id as number),
    enabled: id !== null,
    retry: (count, err) => {
      if (err instanceof ProductNotFoundError) return false;
      return count < 1;
    },
    placeholderData: () => {
      if (id === null) return undefined;
      return queryClient.getQueryData<Product[]>(productsQueryKey)?.find((p) => p.id === id);
    },
  });

  useEffect(() => {
    document.documentElement.style.setProperty("--bg", THEME.paper.bg);
    document.documentElement.style.setProperty("--fg", THEME.paper.fg);
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !data) return;
      gsap.from("[data-study]", {
        y: 28,
        autoAlpha: 0,
        duration: 0.75,
        ease: "power3.out",
      });
    },
    { scope: root, dependencies: [data?.id] },
  );

  const isNotFound = id === null || error instanceof ProductNotFoundError;

  return (
    <>
      <main
        ref={root}
        data-theme="paper"
        className="relative overflow-x-clip px-5 pt-28 pb-24 sm:pt-32 sm:pb-28 md:px-10 md:pt-36 md:pb-40 lg:px-14"
      >
        <div className="mb-10 flex flex-col gap-6 border-b border-fg/15 pb-8 md:mb-14 md:flex-row md:items-end md:justify-between md:pb-10">
          <div className="min-w-0">
            <BackToObjects />
            <p className="meta mt-5 text-fg/45">
              <Link to="/" data-cursor="" className="transition-colors duration-300 hover:text-accent">
                Home
              </Link>
              {" / "}
              <Link
                to="/catalogue"
                data-cursor=""
                className="transition-colors duration-300 hover:text-accent"
              >
                Shop / Objects
              </Link>
              {data && !isNotFound ? ` / ${data.title}` : ""}
            </p>
          </div>
        </div>

        {id !== null && isLoading && !data ? <ProductStudySkeleton /> : null}

        {id !== null && isError && !isNotFound && !data ? (
          <ProductError
            message={error instanceof Error ? error.message : undefined}
            onRetry={() => void refetch()}
          />
        ) : null}

        {isNotFound || (id !== null && !isLoading && !isError && !data) ? (
          <ProductMissing />
        ) : null}

        {data && !isNotFound ? (
          <div data-study>
            <ProductDetails product={data} />
          </div>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
