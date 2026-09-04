import { useMemo, useState } from "react";

/**
 * Slice a filtered list into pages. Resets to page 1 when `resetKey` changes
 * (search, filters, sort).
 */
export function useProductPagination<T>(items: T[], pageSize: number, resetKey: string) {
  const [page, setPage] = useState(1);
  const [seenKey, setSeenKey] = useState(resetKey);

  let current = page;
  if (seenKey !== resetKey) {
    setSeenKey(resetKey);
    setPage(1);
    current = 1;
  }

  return useMemo(() => {
    const total = items.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(Math.max(1, current), pageCount);
    const startIndex = total === 0 ? 0 : (currentPage - 1) * pageSize;
    const end = Math.min(startIndex + pageSize, total);
    const rangeStart = total === 0 ? 0 : startIndex + 1;

    return {
      page: currentPage,
      setPage,
      pageCount,
      pageItems: items.slice(startIndex, end),
      rangeStart,
      rangeEnd: end,
      total,
      canPrev: currentPage > 1,
      canNext: currentPage < pageCount && total > 0,
    };
  }, [items, current, pageSize]);
}
