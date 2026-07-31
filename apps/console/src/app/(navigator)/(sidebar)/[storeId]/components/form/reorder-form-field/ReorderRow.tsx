import { GripVertical } from "lucide-react";
import { DragHandleProps } from "../../../hooks/useDragSort";
import { cn } from "@ssurak/ui/lib/utils";

type ReorderRowProps = {
  reorderName: string;
  isHighlighted?: boolean;
  children?: React.ReactNode;
  dragHandleProps: DragHandleProps;
};

export default function ReorderRow({
  reorderName,
  children,
  isHighlighted,
  dragHandleProps,
}: ReorderRowProps) {
  return (
    <>
      <button
        type="button"
        aria-label={`${reorderName} 순서 변경`}
        className={cn(
          "mr-2 p-1 -ml-1 touch-none text-zinc-300 hover:text-gray-500 cursor-grab active:cursor-grabbing",
          { "text-green-700": isHighlighted }
        )}
        {...dragHandleProps}
      >
        <GripVertical size={12} />
      </button>
      <span
        className={cn("mr-auto font-bold text-sm", {
          "text-green-700 dark:text-green-400": isHighlighted,
        })}
      >
        {reorderName}
      </span>
      {children}
    </>
  );
}
