"use client";

import { Badge } from "@ssurak/ui/components/forms/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@ssurak/ui/components/layouts/sheet";
import { cn } from "@ssurak/ui/lib/utils";
import DragReorder from "../../../../components/form/reorder-form-field/DragReorder";
import { DragRowProps } from "../../../../hooks/useDragSort";
import { OptionGroupForm } from "../../../types/option-form.type";
import { Control, useWatch } from "react-hook-form";

type OptionGroupProps = {
  control: Control<OptionGroupForm>;
  hasError: boolean;
  /** 저장된 그룹에만 준다. 아직 서버에 없는 새 그룹은 순서를 가질 수 없다. */
  drag?: DragRowProps;
  /** 시트 맨 아래에 고정으로 남는 삭제·확정 줄. */
  footer?: React.ReactNode;
  /** 저장 성공 시 바깥에서 시트를 닫을 수 있도록 열림 상태는 부모가 쥔다. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export default function OptionGroup({
  control,
  hasError,
  drag,
  footer,
  open,
  onOpenChange,
  children,
}: OptionGroupProps) {
  const name = useWatch({ control, name: "name" });
  const choices = useWatch({ control, name: "choices" });
  const required = useWatch({ control, name: "required" });
  const enabled = useWatch({ control, name: "enabled" });
  const trigger = useWatch({ control, name: "trigger" });

  const notes = [
    ...(enabled ? [] : ["미노출"]),
    ...(trigger.length > 0 ? ["조건부 노출"] : []),
  ];

  const optionKeys = choices
    .map((choice) => choice.name.trim())
    .filter((choiceName) => choiceName !== "");

  const groupTitle = name || "새 옵션 그룹";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <div
        role="group"
        aria-label={groupTitle}
        className={cn(
          "flex items-center flex-wrap h-14 px-3 bg-background transition-colors hover:bg-accent",
          {
            "shadow-lg": drag?.isDragging,
            "shadow-[inset_0_-2px_0_0_var(--color-primary)]":
              drag?.dropEdge === "bottom",
            "shadow-[inset_0_2px_0_0_var(--color-primary)]":
              drag?.dropEdge === "top",
          }
        )}
        {...drag?.itemProps}
      >
        {drag && (
          <DragReorder
            dragHandleProps={drag.handleProps}
            aria-label={`${groupTitle} 순서 변경`}
            disabled={drag.isDisabled}
          />
        )}
        <SheetTrigger asChild>
          <button
            type="button"
            className="flex flex-1 items-center gap-x-1.5 h-full min-w-0 text-left cursor-pointer"
          >
            <span
              className={cn("font-bold text-sm truncate shrink-0", {
                "text-destructive": hasError,
              })}
            >
              {groupTitle}
            </span>
            {optionKeys.map((optionKey, index) => (
              <Badge
                key={`${optionKey}-${index}`}
                variant={required ? "destructive" : "inactive"}
                className="shrink-0"
              >
                {optionKey}
              </Badge>
            ))}
            {notes.map((note) => (
              <Badge key={note} variant="outline" className="shrink-0">
                {note}
              </Badge>
            ))}
          </button>
        </SheetTrigger>
      </div>

      <SheetContent
        side="left"
        className="min-w-full sm:min-w-4/5 lg:min-w-2/3"
      >
        <SheetHeader className="border-b p-2">
          <SheetTitle>{groupTitle}</SheetTitle>
          <SheetDescription>
            손님이 고르는 선택지와 노출 조건을 설정합니다.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-2">{children}</div>
        {footer && (
          <SheetFooter className="flex-row items-center justify-between gap-x-2 border-t p-2">
            {footer}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
