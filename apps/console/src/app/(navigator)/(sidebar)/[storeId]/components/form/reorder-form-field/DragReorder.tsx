import { cn } from "@ssurak/ui/lib/utils";
import { GripVertical } from "lucide-react";
import { ComponentProps } from "react";
import { DragHandleProps } from "../../../hooks/useDragSort";

export default function DragReorder({
  dragHandleProps,
  ...props
}: { dragHandleProps: DragHandleProps } & ComponentProps<"button">) {
  const { className, ...rest } = props;
  return (
    <button
      type="button"
      className={cn(
        "sm:mr-2 p-1 -ml-1 touch-none text-zinc-300 hover:text-gray-500 cursor-grab active:cursor-grabbing",
        "disabled:cursor-progress disabled:opacity-40 disabled:hover:text-zinc-300",
        className
      )}
      {...dragHandleProps}
      {...rest}
    >
      <GripVertical size={12} />
    </button>
  );
}
