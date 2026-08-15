import { Button } from "@ssurak/ui/components/buttons/button";
import { cn } from "@ssurak/ui/lib/utils";
import { ComponentProps } from "react";

export default function AddFieldButton({
  onClick,
  children,
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant={"outline"}
      className={cn(
        "shadow-sm border-dashed w-full text-muted-foreground bg-background font-bold",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </Button>
  );
}
