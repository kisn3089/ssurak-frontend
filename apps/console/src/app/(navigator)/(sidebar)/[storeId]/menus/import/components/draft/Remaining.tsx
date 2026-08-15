import { MenuDraftListResponse } from "@ssurak/api/types/menuDraft/menuDraft.interface";
import CircleProgress from "@ssurak/ui/components/circle-progress/CircleProgress";
import { Separator } from "@ssurak/ui/components/forms/separator";
import { cn } from "@ssurak/ui/lib/utils";
import { formatRemaining } from "@ssurak/ui/utils/date-format";
import { Sparkles, Timer } from "lucide-react";

type RemainingProps = {
  children: React.ReactNode;
  remainingInfo: Omit<MenuDraftListResponse, "drafts">;
};

export default function Remaining({
  children,
  remainingInfo: { remaining, resetAt, rateLimit, rateWindowHours },
}: RemainingProps) {
  const isNearAttemptLimit =
    remaining !== null && remaining <= Math.ceil(rateLimit / 3);

  const hasReachedAttemptLimit = remaining !== null && remaining === 0;

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-x-2 rounded-3xl w-fit ml-auto border border-blue-100 dark:border-blue-900/60 bg-blue-primary py-1.5 px-4 my-2",
          {
            "bg-amber-50 dark:bg-amber-950/40 border-amber-200/70 dark:border-amber-900/60":
              isNearAttemptLimit,
            "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60":
              hasReachedAttemptLimit,
          }
        )}
      >
        <Sparkles
          strokeWidth={1.8}
          size={15}
          className={cn("text-blue-600 dark:text-blue-400", {
            "text-amber-700 dark:text-amber-400": isNearAttemptLimit,
            "text-rose-700 dark:text-rose-400": hasReachedAttemptLimit,
          })}
        />
        <p className="text-xs font-semibold">남은 추출</p>
        <CircleProgress
          max={rateLimit}
          value={remaining ?? 0}
          className={cn(
            "data-filled:bg-blue-600 dark:data-filled:bg-blue-400",
            {
              "data-filled:bg-amber-700 dark:data-filled:bg-amber-400":
                isNearAttemptLimit,
              "data-filled:bg-rose-700 dark:data-filled:bg-rose-400":
                hasReachedAttemptLimit,
            }
          )}
        />
        <p
          className={cn("text-sm font-bold text-blue-600 dark:text-blue-400", {
            "text-amber-700 dark:text-amber-400": isNearAttemptLimit,
            "text-rose-700 dark:text-rose-400": hasReachedAttemptLimit,
          })}
        >
          {remaining ?? 0}회
        </p>
        <Separator orientation="vertical" className="text-accent h-3.5" />
        <Timer size={14} className="text-muted-foreground" />
        <p className="text-xs font-semibold text-muted-foreground">
          {resetAt
            ? `${formatRemaining(resetAt)}충전`
            : `첫 사용 시 ${rateWindowHours}시간 시작`}
        </p>
      </div>
      {children}
    </>
  );
}
