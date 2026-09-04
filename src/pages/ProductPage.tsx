import { useEffect, useMemo, useRef } from "react";
import { Link, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { THEME } from "@/lib/motion";
import {
  fetchProductById,
  fetchProducts,
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

function pickRelated(all: Product[] | undefined, current: Product, count = 4) {
  if (!all?.length) return [];
  const others = all.filter((item) => item.id !== current.id);
  const same = others.filter((item) => item.category === current.category);
  const rest = others.filter((item) => item.category !== current.category);
  return [...same, ...rest].slice(0, count);
}

function BackToObjects() {
  return (
    <Link
      to="/catalogue"
      data-cursor=""
      className="meta inline-flex items-center gap-2 text-fg/55 transition-colors duration-300 hover:text-accent"
    >
      <ArrowLeft className="size-3.5" strokeWidth={1.5} />
      Back to Catalogue
    </Link>
  );
}

function ProductStudySkeleton() {
  return (
    <div
      aria-hidden
      className="grid grid-cols-1 gap-10 border-t border-fg/15 px-5 pt-6 pb-16 sm:px-8 md:px-10 md:pt-8 lg:grid-cols-12 lg:gap-x-10 lg:px-14 xl:gap-x-14 xl:px-16"
    >
      <div className="flex flex-col gap-3 lg:col-span-7 lg:flex-row-reverse lg:gap-4">
        <div className="aspect-[4/5] w-full animate-pulse border border-fg/10 bg-fg/[0.04] md:aspect-[4/3] lg:aspect-auto lg:h-[calc(100svh-8.5rem)] lg:min-h-[34rem]" />
        <div className="flex gap-2 lg:w-16 lg:flex-col">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="aspect-[4/5] w-14 animate-pulse bg-fg/[0.05] sm:w-16 lg:w-full" />
          ))}
        </div>
      </div>
      <div className="animate-pulse space-y-6 lg:col-span-5">
        <div className="h-2 w-40 bg-fg/10" />
        <div className="space-y-3 pt-2">
          <div className="h-12 w-11/12 bg-fg/[0.08]" />
          <div className="h-12 w-3/5 bg-fg/[0.08]" />
        </div>
        <div className="h-4 w-32 bg-fg/10" />
        <div className="h-2 w-48 bg-fg/10" />
        <div className="h-10 w-36 bg-fg/[0.08]" />
        <div className="space-y-2 pt-2">
          <div className="h-3 w-full max-w-md bg-fg/10" />
          <div className="h-3 w-5/6 max-w-md bg-fg/10" />
          <div className="h-3 w-2/3 max-w-md bg-fg/10" />
        </div>
        <div className="mt-4 h-32 w-full border border-fg/10 bg-fg/[0.03]" />
      </div>
    </div>
  );
}

function ProductMissing() {
  return (
    <div className="px-5 py-24 sm:px-8 md:px-10 lg:px-14">
      <EditorialState
        eyebrow="Not found"
        accent
        title="This object is no longer in the issue."
        body="It may have left the catalogue, or the link is incomplete."
        action={
          <Link to="/catalogue" data-cursor="" className={ui.btnGhostTheme}>
            Back to Catalogue
          </Link>
        }
      />
    </div>
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

  const catalogue = useQuery({
    queryKey: productsQueryKey,
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  const related = useMemo(
    () => (data ? pickRelated(catalogue.data, data) : []),
    [catalogue.data, data],
  );

  useEffect(() => {
    document.documentElement.style.setProperty("--bg", THEME.paper.bg);
    document.documentElement.style.setProperty("--fg", THEME.paper.fg);
  }, []);

  const isNotFound = id === null || error instanceof ProductNotFoundError;

  return (
    <>
      <main
        ref={root}
        data-theme="paper"
        className="relative overflow-x-clip pt-24 pb-0 sm:pt-28 md:pt-32"
      >
        <div className="flex flex-col gap-4 px-5 pt-4 pb-6 sm:px-8 sm:pb-8 md:flex-row md:items-end md:justify-between md:px-10 lg:px-14 xl:px-16">
          <div className="min-w-0">
            <BackToObjects />
            <p className="meta mt-4 truncate text-fg/45">
              <Link to="/" data-cursor="" className="transition-colors duration-300 hover:text-accent">
                Home
              </Link>
              <span className="mx-2 text-fg/25">/</span>
              <Link
                to="/catalogue"
                data-cursor=""
                className="transition-colors duration-300 hover:text-accent"
              >
                Catalogue
              </Link>
              {data && !isNotFound ? (
                <>
                  <span className="mx-2 text-fg/25">/</span>
                  <span className="text-fg/70">{data.title}</span>
                </>
              ) : null}
            </p>
          </div>
          {data && !isNotFound ? (
            <p className="meta hidden text-fg/40 md:block">
              Object study
              <span className="mx-2 text-fg/25">·</span>
              N° {String(data.id).padStart(3, "0")}
            </p>
          ) : null}
        </div>

        {id !== null && isLoading && !data ? <ProductStudySkeleton /> : null}

        {id !== null && isError && !isNotFound && !data ? (
          <div className="px-5 py-16 sm:px-8 md:px-10 lg:px-14">
            <ProductError
              message={error instanceof Error ? error.message : undefined}
              onRetry={() => void refetch()}
            />
          </div>
        ) : null}

        {isNotFound || (id !== null && !isLoading && !isError && !data) ? (
          <ProductMissing />
        ) : null}

        {data && !isNotFound ? <ProductDetails product={data} related={related} /> : null}
      </main>
      <Footer />
    </>
  );
}
