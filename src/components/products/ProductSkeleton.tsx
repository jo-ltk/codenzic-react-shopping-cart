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
          <div className="aspect-[4/5] w-full border border-fg/10 bg-[radial-gradient(120%_90%_at_50%_32%,#f7f2e9_0%,#ede6d9_52%,#dcd3c3_100%)]" />
          <div className="mt-5 space-y-3">
            <div className="h-2 w-24 bg-fg/10" />
            <div className="h-6 w-3/4 max-w-[16rem] bg-fg/[0.08]" />
            <div className="flex gap-3 pt-1">
              <div className="h-2 w-10 bg-fg/10" />
              <div className="h-2 w-16 bg-fg/10" />
            </div>
            <div className="h-7 w-20 bg-fg/[0.08] pt-2" />
            <div className="mt-2 h-11 w-full bg-fg/[0.08]" />
          </div>
        </article>
      ))}
    </div>
  );
}
