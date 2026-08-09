import { DragHandleProps } from "../../../hooks/useDragSort";
import { cn } from "@ssurak/ui/lib/utils";
import DragReorder from "./DragReorder";

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
      <DragReorder
        className={cn({ "text-green-700": isHighlighted })}
        aria-label={`${reorderName} 순서 변경`}
        dragHandleProps={dragHandleProps}
      />
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
