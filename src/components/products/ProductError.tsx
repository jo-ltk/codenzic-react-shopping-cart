interface ProductErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function ProductError({
  message = "The catalogue could not be reached.",
  onRetry,
}: ProductErrorProps) {
  return (
    <div className="mx-auto max-w-md border border-fg/15 px-8 py-16 text-center md:px-12 md:py-20">
      <span className="meta text-accent">Unavailable</span>
      <p className="mt-5 font-display text-2xl leading-snug font-light md:text-3xl">
        Objects temporarily out of reach.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-fg/55">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          data-cursor=""
          className="meta mt-10 inline-flex items-center justify-center border border-fg/25 px-7 py-3.5 text-fg transition-colors duration-500 hover:border-accent hover:text-accent"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
