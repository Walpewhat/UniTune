import { cn } from "@/lib/utils/cn";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/70",
        "bg-gradient-to-r from-muted/60 via-muted to-muted/60 bg-[length:200%_100%]",
        className,
      )}
      style={{ animation: "skeleton-shimmer 1.6s ease-in-out infinite" }}
      {...props}
    />
  );
}
export { Skeleton };
