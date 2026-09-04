interface ProductFilterEmptyProps {
  onClear?: () => void;
}

/** Empty state when search/filters yield no matches. */
export function ProductFilterEmpty({ onClear }: ProductFilterEmptyProps) {
  return (
    <div className="mx-auto max-w-md border border-fg/15 px-8 py-16 text-center md:px-12 md:py-20">
      <span className="meta text-accent">No matches</span>
      <p className="mt-5 font-display text-2xl leading-snug font-light md:text-3xl">
        No objects match these filters.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-fg/55">
        Try another title, category, or price range — or clear the filters to
        return to the full catalogue.
      </p>
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          data-cursor=""
          className="meta mt-10 inline-flex min-h-11 items-center justify-center border border-fg/25 px-7 py-3.5 text-fg transition-colors duration-500 hover:border-accent hover:text-accent"
        >
          Clear all filters
        </button>
      ) : null}
    </div>
  );
}
