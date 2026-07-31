"use client";

import { useGlobalTimer } from "./GlobalTimerContext";
import {
  formatTime,
  isWithinThreshold,
} from "@ssurak/ui/utils/formatSessionTime";

export default function SessionExpireTime({
  expiresAt,
}: {
  expiresAt: Date | undefined;
}) {
  const currentTime = useGlobalTimer();

  const remainingMinutes: string | number = (() => {
    if (!expiresAt) return "";

    const expiryTime = expiresAt.getTime();
    if (Number.isNaN(expiryTime)) return "";

    const timeDiff = expiryTime - currentTime;

    if (timeDiff < 0) return "만료";

    return Math.ceil(timeDiff / (1000 * 60));
  })();

  const isExpiringSoon =
    typeof remainingMinutes === "number"
      ? isWithinThreshold(remainingMinutes, 20)
      : true;

  return (
    <p
      className={`w-full text-center font-semibold text-sm ${isExpiringSoon ? "text-destructive" : ""}`}
    >
      {typeof remainingMinutes === "number"
        ? formatTime(remainingMinutes)
        : remainingMinutes}
    </p>
  );
}
