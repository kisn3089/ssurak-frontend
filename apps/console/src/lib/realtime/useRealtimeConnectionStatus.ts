"use client";

import { useSyncExternalStore } from "react";
import {
  getRealtimeConnectionStatus,
  subscribeRealtimeConnectionStatus,
} from "./socket";
import type { RealtimeConnectionStatus } from "./socket";

export type { RealtimeConnectionStatus };

/** 서버 렌더에는 소켓이 없다. */
const getServerConnectionStatusSnapshot = (): RealtimeConnectionStatus =>
  "disconnected";

export function useRealtimeConnectionStatus(): RealtimeConnectionStatus {
  return useSyncExternalStore(
    subscribeRealtimeConnectionStatus,
    getRealtimeConnectionStatus,
    getServerConnectionStatusSnapshot
  );
}
