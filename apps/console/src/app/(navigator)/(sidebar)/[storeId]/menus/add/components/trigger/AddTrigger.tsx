import { Button } from "@ssurak/ui/components/buttons/button";
import { ComponentProps } from "react";

export default function AddTrigger({ ...props }: ComponentProps<"button">) {
  return (
    <Button
      type="button"
      className="bg-background text-blue-primary-foreground font-bold text-sm border border-dashed border-blue-primary-edge mt-2 hover:bg-blue-50 hover:border-blue-600 dark:hover:bg-slate-800 dark:hover:border-blue-600"
      {...props}
    >
      + 조건 추가
    </Button>
  );
}
