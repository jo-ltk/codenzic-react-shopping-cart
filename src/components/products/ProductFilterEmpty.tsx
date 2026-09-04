import { EditorialState } from "@/components/EditorialState";
import { ui } from "@/lib/ui";

interface ProductFilterEmptyProps {
  onClear?: () => void;
}

/** Empty state when search/filters yield no matches. */
export function ProductFilterEmpty({ onClear }: ProductFilterEmptyProps) {
  return (
    <EditorialState
      eyebrow="No matches"
      accent
      title="No objects match these filters."
      body="Try another title, category, or price range — or clear the filters to return to the full catalogue."
      action={
        onClear ? (
          <button type="button" onClick={onClear} data-cursor="" className={ui.btnGhostTheme}>
            Clear all filters
          </button>
        ) : null
      }
    />
  );
}
