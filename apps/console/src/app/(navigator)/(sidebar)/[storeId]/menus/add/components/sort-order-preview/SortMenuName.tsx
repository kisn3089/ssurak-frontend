import { cn } from "@ssurak/ui/lib/utils";

type SortMenuNameProps = {
  name: string;
  isNew: boolean;
};

export default function SortMenuName({ name, isNew }: SortMenuNameProps) {
  return (
    <span
      className={cn(
        "min-w-0 truncate text-sm",
        isNew
          ? "font-bold text-teal-700 dark:text-emerald-400"
          : "font-medium text-foreground"
      )}
    >
      {name}
    </span>
  );
}
