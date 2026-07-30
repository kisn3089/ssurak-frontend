"use client";

import { reconnectRealtime } from "@/lib/realtime/socket";
import { useRealtimeConnectionStatus } from "@/lib/realtime/useRealtimeConnectionStatus";

const MESSAGE_BY_STATUS = {
  connecting: "실시간 연결 끊김 · 자동 재연결 중…",
  disconnected: "실시간 연결을 준비하는 중…",
  failed: "실시간 연결이 끊겼습니다. 자동으로 다시 연결되지 않습니다.",
} as const;

const STYLE_BY_STATUS = {
  connecting: "bg-amber-100 text-amber-900 border-amber-200",
  disconnected: "bg-zinc-100 text-zinc-700 border-zinc-200",
  failed: "bg-red-100 text-red-900 border-red-200",
} as const;

export default function RealtimeStatusBanner() {
  const status = useRealtimeConnectionStatus();

  if (status === "connected") return null;

  return (
    <div
      className={`flex w-full items-center justify-center gap-2 border-b py-1.5 text-xs font-semibold ${STYLE_BY_STATUS[status]}`}
    >
      {/* 버튼은 라이브 리전 밖에 둬야 상태 변경 때 레이블까지 읽히지 않는다 */}
      <span role="status">{MESSAGE_BY_STATUS[status]}</span>
      {status === "failed" && (
        <button
          type="button"
          onClick={reconnectRealtime}
          className="rounded-sm underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current hover:cursor-pointer"
        >
          다시 연결
        </button>
      )}
    </div>
  );
}
