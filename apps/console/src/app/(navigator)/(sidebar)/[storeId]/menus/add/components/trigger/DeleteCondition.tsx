import { Button } from "@ssurak/ui/components/buttons/button";
import { ComponentProps } from "react";

export default function DeleteCondition({
  ...props
}: ComponentProps<"button">) {
  return (
    <Button
      type="button"
      className="text-xs bg-blue-primary-highlight text-background ml-auto border-none hover:bg-blue-700 dark:hover:bg-blue-400"
      size={"sm"}
      {...props}
    >
      삭제
    </Button>
  );
}
