import { LoadingState } from "@/components/ui/states";

/** CS-local loading for public eventi routes. Does not copy the PI inventory file. */
export default function EventiLoading() {
  return <LoadingState label="Caricamento eventi…" />;
}
