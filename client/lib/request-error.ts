import { toast } from "sonner";

export function showRequestError(title: string, error: unknown) {
  toast.error(title, {
    description: error instanceof Error ? error.message : "Please try again.",
  });
}
