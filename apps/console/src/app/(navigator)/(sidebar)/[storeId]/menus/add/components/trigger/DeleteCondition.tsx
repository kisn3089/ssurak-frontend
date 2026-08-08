import { Button } from "@ssurak/ui/components/buttons/button";
import { ComponentProps } from "react";

export default function DeleteCondition({
  ...props
}: ComponentProps<"button">) {
  return (
    <Button
      type="button"
      className="text-xs font-bold bg-blue-primary-highlight text-background ml-auto border-none hover:bg-blue-700 dark:hover:bg-blue-400"
      size={"sm"}
      // 카드 아래쪽 옵션 삭제 버튼과 이름이 겹치지 않게 조건 쪽임을 밝힌다.
      aria-label="조건 삭제"
      {...props}
    >
      삭제
    </Button>
  );
}
