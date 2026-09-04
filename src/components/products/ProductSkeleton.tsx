export function ProductSkeleton() {
  return (
    <div
      aria-hidden
      className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-x-8 lg:gap-y-20"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <article key={i} className="animate-pulse">
          <div className="aspect-[3/4] w-full bg-fg/[0.06]" />
          <div className="mt-5 space-y-3">
            <div className="h-2 w-16 bg-fg/10" />
            <div className="h-5 w-3/4 bg-fg/[0.08]" />
            <div className="flex justify-between pt-1">
              <div className="h-2 w-14 bg-fg/10" />
              <div className="h-2 w-10 bg-fg/10" />
            </div>
            <div className="mt-4 h-10 w-full border border-fg/10" />
          </div>
        </article>
      ))}
    </div>
  );
}
