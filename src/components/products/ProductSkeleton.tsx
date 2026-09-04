import { cn } from "@/lib/utils";

interface ProductSkeletonProps {
  count?: number;
  className?: string;
}

export function ProductSkeleton({ count = 8, className }: ProductSkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-20 xl:grid-cols-4",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <article key={i} className="animate-pulse">
          <div className="aspect-[3/4] w-full border border-fg/10 bg-fg/[0.05]" />
          <div className="mt-5 space-y-3">
            <div className="h-2 w-16 bg-fg/10" />
            <div className="h-5 w-3/4 max-w-[16rem] bg-fg/[0.08]" />
            <div className="flex justify-between gap-4 pt-1">
              <div className="h-2 w-14 bg-fg/10" />
              <div className="h-2 w-10 bg-fg/10" />
            </div>
            <div className="mt-4 h-11 w-full border border-fg/10 bg-fg/[0.03]" />
          </div>
        </article>
      ))}
    </div>
  );
}
