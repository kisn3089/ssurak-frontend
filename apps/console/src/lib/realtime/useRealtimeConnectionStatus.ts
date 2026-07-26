"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  getRealtimeSocket,
  getRealtimeSocketEpoch,
  subscribeRealtimeSocketEpoch,
} from "./socket";

export type RealtimeConnectionStatus =
  | "connected"
  | "connecting"
  | "disconnected"
  | "failed";

const getServerRealtimeSocketEpoch = (): number => 0;

export function useRealtimeConnectionStatus(): RealtimeConnectionStatus {
  const [status, setStatus] = useState<RealtimeConnectionStatus>(() => {
    if (typeof window === "undefined") return "disconnected";
    return getRealtimeSocket().connected ? "connected" : "disconnected";
  });

  /** resetRealtimeSocket으로 인스턴스가 교체되면 새 소켓에 리스너를 다시 붙인다 */
  const socketEpoch = useSyncExternalStore(
    subscribeRealtimeSocketEpoch,
    getRealtimeSocketEpoch,
    getServerRealtimeSocketEpoch
  );

  useEffect(() => {
    const socket = getRealtimeSocket();

    // 리스너 부착 전에 이미 connect가 발화했을 수 있으므로 현재 상태로 동기화
    setStatus(socket.connected ? "connected" : "disconnected");

    const onConnect = () => setStatus("connected");
    const onDisconnect = () => setStatus("disconnected");
    const onReconnectAttempt = () => setStatus("connecting");
    const onReconnectFailed = () => setStatus("failed");

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.io.on("reconnect_attempt", onReconnectAttempt);
    socket.io.on("reconnect_failed", onReconnectFailed);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.io.off("reconnect_attempt", onReconnectAttempt);
      socket.io.off("reconnect_failed", onReconnectFailed);
    };
  }, [socketEpoch]);

  return status;
}
