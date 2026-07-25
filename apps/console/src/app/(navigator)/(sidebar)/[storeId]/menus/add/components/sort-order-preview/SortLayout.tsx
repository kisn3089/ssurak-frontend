import { cn } from "@ssurak/ui/lib/utils";

type SortLayoutProps = {
  isNew: boolean;
  children: React.ReactNode;
};

export default function SortLayout({ isNew, children }: SortLayoutProps) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3 py-2.5",
        isNew &&
          "border border-lime-500 bg-green-50 dark:border-emerald-500/40 dark:bg-emerald-500/10"
      )}
    >
      {children}
    </li>
  );
}
