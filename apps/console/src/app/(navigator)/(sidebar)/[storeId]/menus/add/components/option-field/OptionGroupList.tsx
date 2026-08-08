"use client";

import { cn } from "@ssurak/ui/lib/utils";

type OptionGroupListProps = {
  ref?: React.Ref<HTMLDivElement>;
  /** 그룹이 하나도 없으면 빈 테두리만 남으므로 목록째 감춘다. */
  isEmpty: boolean;
  children: React.ReactNode;
};

/** 옵션 그룹 줄을 담는 목록. 메뉴·카테고리 정렬 목록(ReorderForm)과 같은 껍데기다. */
export default function OptionGroupList({
  ref,
  isEmpty,
  children,
}: OptionGroupListProps) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col divide-y divide-accent rounded-2xl border border-border overflow-hidden",
        { hidden: isEmpty }
      )}
    >
      {children}
    </div>
  );
}
