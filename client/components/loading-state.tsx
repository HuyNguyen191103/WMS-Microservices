import { cn } from "@/lib/utils";

type LoadingStateProps = {
  message: string;
  className?: string;
};

export function LoadingState({ message, className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-slate-200 bg-white p-8 text-center text-sm text-slate-500",
        className,
      )}
    >
      {message}
    </div>
  );
}
