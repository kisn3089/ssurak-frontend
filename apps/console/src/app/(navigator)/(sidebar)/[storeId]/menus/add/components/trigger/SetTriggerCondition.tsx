import { Button } from "@ssurak/ui/components/buttons/button";
import { cn } from "@ssurak/ui/lib/utils";
import { ComponentProps } from "react";

export default function SetTriggerCondition({
  isActive,
  children,
  ...props
}: ComponentProps<"button"> & {
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      aria-pressed={isActive}
      className={cn(
        "font-bold bg-background text-blue-primary-foreground hover:bg-blue-50 rounded-3xl text-xs border-blue-primary-edge hover:border-blue-300 dark:hover:bg-slate-800 dark:hover:border-blue-600",
        {
          "bg-blue-primary-highlight text-background hover:bg-blue-700 dark:hover:bg-blue-400":
            isActive,
        }
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
