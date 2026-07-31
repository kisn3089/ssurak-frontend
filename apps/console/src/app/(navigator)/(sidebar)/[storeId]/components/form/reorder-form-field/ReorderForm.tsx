"use client";

import { cn } from "@ssurak/ui/lib/utils";
import useDragSort, {
  DragHandleProps,
  reorder,
} from "../../../hooks/useDragSort";
import ReorderRow from "./ReorderRow";
import { Badge } from "@ssurak/ui/components/forms/badge";

export interface ReorderRowData {
  id: string;
  name: string;
}

export type ReorderChildrenProps<T> = {
  row: T;
  index: number;
  getHandleProps: (index: number) => DragHandleProps;
};

export type ReorderFormProps<T> = {
  reorderRow: T[];
  renderCreateRow?: React.ReactNode;
  badgeLabel?: string;
  isHighlightRow?: (rows: ReorderRowData[]) => ReorderRowData["id"] | undefined;
  onReorder: (reorderedIds: string[]) => void;
  renderMetaInfo?: (row: T) => React.ReactNode;
  children?: (props: ReorderChildrenProps<T>) => React.ReactNode;
};
export default function ReorderForm<T extends ReorderRowData>({
  reorderRow,
  badgeLabel,
  renderCreateRow,
  onReorder,
  isHighlightRow,
  renderMetaInfo,
  children,
}: ReorderFormProps<T>) {
  const { listRef, draggingIndex, targetIndex, getHandleProps, getItemProps } =
    useDragSort(reorderRow.length, (from, to) =>
      onReorder(reorder(reorderRow, from, to).map((row) => row.id))
    );

  return (
    <div
      ref={listRef}
      className="flex flex-col divide-y divide-accent rounded-2xl border border-border overflow-hidden"
    >
      {reorderRow.map((row, index) => {
        const isHighlighted = isHighlightRow?.(reorderRow) === row.id;
        return (
          <div
            className={cn(
              "flex items-center justify-between h-14 px-3 bg-background",
              { "shadow-lg": draggingIndex === index },
              targetIndex === index &&
                draggingIndex !== null &&
                draggingIndex !== index &&
                (draggingIndex < index
                  ? "shadow-[inset_0_-2px_0_0_var(--color-primary)]"
                  : "shadow-[inset_0_2px_0_0_var(--color-primary)]"),
              { "bg-green-50 dark:bg-green-400/15": isHighlighted }
            )}
            key={row.id}
            {...getItemProps(index)}
          >
            {children ? (
              children({ row, index, getHandleProps })
            ) : (
              <ReorderRow
                reorderName={row.name}
                dragHandleProps={getHandleProps(index)}
                isHighlighted={isHighlighted}
              >
                {renderMetaInfo ? (
                  renderMetaInfo?.(row)
                ) : (
                  <>
                    {isHighlighted && badgeLabel && (
                      <Badge className="text-xs bg-green-100 dark:bg-green-400/20 text-green-700 dark:text-green-400 mr-2 font-bold">
                        {badgeLabel}
                      </Badge>
                    )}
                    <span
                      className={cn(
                        "grid place-content-center w-7 h-6 bg-muted rounded-md text-xs font-bold text-muted-foreground/80 truncate",
                        {
                          "bg-green-600 dark:bg-green-500 text-primary-foreground dark:text-green-950":
                            isHighlighted,
                        }
                      )}
                    >
                      {index + 1}
                    </span>
                  </>
                )}
              </ReorderRow>
            )}
          </div>
        );
      })}
      {renderCreateRow}
    </div>
  );
}
