"use client";

import { Button } from "@ssurak/ui/components/buttons/button";
import { Badge } from "@ssurak/ui/components/forms/badge";
import { cn } from "@ssurak/ui/lib/utils";
import { ChevronDown, XIcon } from "lucide-react";
import { useState } from "react";

type OptionGroupProps = {
  title: string;
  /** 그룹에 들어있는 옵션 값 이름들. 접힌 상태에서 내용을 알려주는 역할이다. */
  optionKeys: string[];
  isRequiredOption: boolean;
  hasError: boolean;
  onRemove: () => void;
  children: React.ReactNode;
};

export default function OptionGroup({
  title,
  optionKeys,
  isRequiredOption,
  hasError,
  onRemove,
  children,
}: OptionGroupProps) {
  const [isExpanded, setIsExpanded] = useState(!title);
  const groupTitle = title || "새 옵션 그룹";

  const isOpen = isExpanded || hasError;

  return (
    <div
      role="group"
      aria-label={groupTitle}
      className={cn(
        "h-14 rounded-2xl border px-4 transition-[height] duration-300 ease-in-out overflow-hidden",
        {
          "h-fit": isOpen,
          "border-destructive": hasError,
        }
      )}
    >
      <div className="flex py-3 items-center justify-between gap-x-2">
        <div className="flex items-center gap-x-1.5 min-w-0">
          <span className="font-bold text-sm truncate">{groupTitle}</span>
          {optionKeys.map((optionKey, index) => (
            <Badge
              key={`${optionKey}-${index}`}
              variant={isRequiredOption ? "destructive" : "inactive"}
              className="shrink-0"
            >
              {optionKey}
            </Badge>
          ))}
        </div>
        <div className="flex gap-x-1 shrink-0">
          <Button
            type="button"
            variant={"ghost"}
            size={"icon-sm"}
            aria-label={`${groupTitle} 삭제`}
            onClick={onRemove}
          >
            <XIcon width={16} height={16} className="text-zinc-400" />
          </Button>
          <Button
            type="button"
            variant={"ghost"}
            size={"icon-sm"}
            aria-expanded={isOpen}
            aria-label={`${groupTitle} ${isOpen ? "접기" : "펼치기"}`}
            disabled={hasError}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDown
              width={16}
              height={16}
              className={cn("text-zinc-400 transition-transform", {
                "-rotate-180": isOpen,
              })}
            />
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}
