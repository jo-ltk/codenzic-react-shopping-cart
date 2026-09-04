import { EditorialState } from "@/components/EditorialState";

export function ProductEmpty() {
  return (
    <EditorialState
      eyebrow="Empty"
      title="No objects in this issue."
      body="The catalogue is quiet for now. Check back with the next issue."
    />
  );
}
