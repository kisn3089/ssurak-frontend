import { cn } from "@ssurak/ui/lib/utils";

type SortNumberProps = {
  sortOrder: number;
  isNew: boolean;
};

export default function SortNumber({ sortOrder, isNew }: SortNumberProps) {
  return (
    <span
      className={cn(
        "flex w-7 h-7 shrink-0 items-center justify-center rounded-md tabular-nums text-xs font-semibold",
        isNew
          ? "bg-teal-700 font-bold text-white"
          : "bg-muted text-muted-foreground"
      )}
    >
      {sortOrder}
    </span>
  );
}
