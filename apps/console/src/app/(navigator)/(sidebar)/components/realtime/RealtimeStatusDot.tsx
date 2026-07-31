"use client";

import { reconnectRealtime } from "@/lib/realtime/socket";
import { useRealtimeConnectionStatus } from "@/lib/realtime/useRealtimeConnectionStatus";

const COLOR_BY_STATUS = {
  connected: "bg-emerald-500",
  connecting: "bg-amber-400 animate-pulse",
  disconnected: "bg-zinc-400",
  failed: "bg-red-500",
} as const;

const LABEL_BY_STATUS = {
  connected: "실시간 연결됨",
  connecting: "재연결 시도 중",
  disconnected: "연결 준비 중",
  failed: "연결 실패",
} as const;

const CONTAINER_CLASS =
  "flex items-center justify-center gap-1.5 px-2 py-1 text-xs text-muted-foreground";

export default function RealtimeStatusDot() {
  const status = useRealtimeConnectionStatus();

  const indicator = (
    <>
      <span
        className={`inline-block h-2 w-2 rounded-full ${COLOR_BY_STATUS[status]}`}
      />
      <span className="group-data-[collapsible=icon]:hidden whitespace-pre">
        {LABEL_BY_STATUS[status]}
      </span>
    </>
  );

  /**
   * 배너는 주문 페이지에만 있으므로, 다른 페이지에서 failed에 빠지면 이 점이 유일한 재시도 수단이다.
   * 재연결이 가능한 상태에서만 버튼으로 바꿔 불필요한 탭 정지점을 만들지 않는다.
   */
  if (status === "failed") {
    return (
      <button
        type="button"
        onClick={reconnectRealtime}
        title="연결 실패 · 다시 연결"
        aria-label="연결 실패. 다시 연결하려면 누르세요."
        className={`${CONTAINER_CLASS} rounded-md underline underline-offset-2 hover:bg-accent hover:no-underline hover:cursor-pointer`}
      >
        {indicator}
      </button>
    );
  }

  return (
    <div
      className={CONTAINER_CLASS}
      title={LABEL_BY_STATUS[status]}
      aria-label={LABEL_BY_STATUS[status]}
    >
      {indicator}
    </div>
  );
}
