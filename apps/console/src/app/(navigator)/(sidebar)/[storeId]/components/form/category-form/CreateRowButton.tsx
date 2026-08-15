import { Button } from "@ssurak/ui/components/buttons/button";
import { cn } from "@ssurak/ui/lib/utils";
import { ComponentProps } from "react";

export default function CreateRowButton({
  children,
  ...props
}: { children?: React.ReactNode } & ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant={"outline"}
      className={cn(
        "group h-full w-full shadow-none border-none py-0 rounded-none",
        "pressable:scale-none",
        props.className
      )}
      {...props}
    >
      <span className="font-bold transition-transform group-hover:translate-x-1 group-active:translate-x-2">
        {children}
      </span>
    </Button>
  );
}
