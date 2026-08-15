"use client";

import { Progress } from "@ssurak/ui/components/progress";
import useMinuteTick from "@ssurak/ui/hooks/useMinuteTick";
import { formatRemaining, remainingRatio } from "@ssurak/ui/utils/date-format";
import { cn } from "@ssurak/ui/lib/utils";

const DRAFT_TTL_MS = 12 * 60 * 60 * 1_000;

export default function DraftExpiryProgress({
  expiresAt,
}: {
  expiresAt: string;
}) {
  const now = useMinuteTick();
  const value =
    now === null ? 100 : remainingRatio(expiresAt, DRAFT_TTL_MS, now);

  const isExpiredSoon = value <= 10;

  return (
    <div className="flex w-full items-center justify-end gap-x-2">
      <Progress
        value={value}
        className={"h-1 flex-1 sm:w-1/2 md:w-1/3"}
        indicatorClassName={cn({ "bg-destructive": isExpiredSoon })}
      />
      <p
        className={cn(
          "whitespace-pre text-xs font-semibold text-muted-foreground",
          { "text-destructive": isExpiredSoon }
        )}
      >
        {now === null ? " " : `${formatRemaining(expiresAt, now)}만료`}
      </p>
    </div>
  );
}
