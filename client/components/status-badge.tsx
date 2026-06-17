import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status?: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = (status || "Unknown").toUpperCase();

  return (
    <Badge
      className={cn(
        "border-slate-200 bg-slate-50 text-slate-700",
        normalizedStatus === "ACTIVE" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        normalizedStatus === "DONE" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        normalizedStatus === "CREATED" &&
          "border-sky-200 bg-sky-50 text-sky-700",
        (normalizedStatus === "DELETE" || normalizedStatus === "DELETED") &&
          "border-red-200 bg-red-50 text-red-700",
        normalizedStatus === "INACTIVE" &&
          "border-amber-200 bg-amber-50 text-amber-700",
      )}
    >
      {normalizedStatus}
    </Badge>
  );
}
