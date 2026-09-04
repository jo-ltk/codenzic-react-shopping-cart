export function ProductEmpty() {
  return (
    <div className="mx-auto max-w-md border border-fg/15 px-8 py-16 text-center md:px-12 md:py-20">
      <span className="meta text-fg/50">Empty</span>
      <p className="mt-5 font-display text-2xl leading-snug font-light md:text-3xl">
        No objects in this issue.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-fg/55">
        The catalogue is quiet for now. Check back with the next issue.
      </p>
    </div>
  );
}
