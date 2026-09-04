import { EditorialState } from "@/components/EditorialState";
import { ui } from "@/lib/ui";

interface ProductErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function ProductError({
  message = "The catalogue could not be reached.",
  onRetry,
}: ProductErrorProps) {
  return (
    <EditorialState
      eyebrow="Unavailable"
      accent
      title="Objects temporarily out of reach."
      body={message}
      action={
        onRetry ? (
          <button type="button" onClick={onRetry} data-cursor="" className={ui.btnGhostTheme}>
            Try again
          </button>
        ) : null
      }
    />
  );
}
