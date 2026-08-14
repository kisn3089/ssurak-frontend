"use client";

import { useSyncExternalStore } from "react";
import { Progress } from "@ssurak/ui/components/progress";
import { formatRemaining, remainingRatio } from "@ssurak/ui/utils/date-format";
import { cn } from "@ssurak/ui/lib/utils";

const TICK_MS = 60_000;
const DRAFT_TTL_MS = 12 * 60 * 60 * 1_000;

let tick = Date.now();
let interval: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function subscribeToTick(listener: () => void) {
  if (interval === null) {
    // 구독이 끊긴 동안 tick이 멈춰 있었으므로 재개 시점에 다시 맞춘다.
    tick = Date.now();
    interval = setInterval(() => {
      tick = Date.now();
      listeners.forEach((notify) => notify());
    }, TICK_MS);
  }
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && interval !== null) {
      clearInterval(interval);
      interval = null;
    }
  };
}

const getTick = () => tick;
const getServerTick = () => null;

export default function DraftExpiryProgress({
  expiresAt,
}: {
  expiresAt: string;
}) {
  const now = useSyncExternalStore(subscribeToTick, getTick, getServerTick);
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
        {now === null ? " " : formatRemaining(expiresAt, now)}
      </p>
    </div>
  );
}
