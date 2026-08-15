"use client";

import { Button } from "@ssurak/ui/components/buttons/button";
import { cn } from "@ssurak/ui/lib/utils";
import { ComponentProps, useState } from "react";
import useDragToConfirm from "../hooks/useDragToConfirm";

type ButtonTransDragProps = {
  onDragConfirm: () => void;
} & ComponentProps<typeof Button>;

/** 한 번 눌러 드래그를 켜고, 트랙 오른쪽 끝까지 밀어야 실행되는 버튼 */
export default function ButtonTransDrag({
  onDragConfirm,
  onClick,
  className,
  children,
  ...props
}: ButtonTransDragProps) {
  const [isArmed, setIsArmed] = useState(false);

  const confirm = () => {
    setIsArmed(false);
    onDragConfirm();
  };

  const { trackRef, thumbProps, shouldIgnoreClick } =
    useDragToConfirm<HTMLButtonElement>({
      enabled: isArmed,
      onConfirm: confirm,
    });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (shouldIgnoreClick()) return;

    // 키보드(Enter·Space)로 온 클릭은 detail이 0이다. 끌 수 없는 입력이므로 바로 확정한다.
    if (isArmed && event.detail === 0) {
      confirm();
      return;
    }

    setIsArmed((prev) => !prev);
    onClick?.(event);
  };

  return (
    <div
      ref={trackRef}
      className={cn("p-1.5 rounded-3xl", {
        "bg-red-100 inset-shadow-red-900 inset-shadow-sm w-48": isArmed,
      })}
    >
      <Button
        {...props}
        {...thumbProps}
        onClick={handleClick}
        className={cn(className, "rounded-3xl font-bold px-5", {
          "shadow-red-900 shadow-sm hover:cursor-grab active:cursor-grabbing":
            isArmed,
        })}
      >
        {children}
      </Button>
    </div>
  );
}
