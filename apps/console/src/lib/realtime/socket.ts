import { http, resolveSsurakBaseURL } from "@ssurak/api/core/axios/http";
import { toast } from "@ssurak/ui/components/sonner";
import { io, Socket } from "socket.io-client";

const REALTIME_URL = `${resolveSsurakBaseURL()}/events`;
const REALTIME_PATH = "/ws/";

export const REALTIME_EVENT = {
  ORDER_CREATED: "order.created",
  ORDER_UPDATED: "order.updated",
  ORDER_CANCELLED: "order.cancelled",
  ORDER_ITEM_UPDATED: "order.item.updated",
  ORDER_ITEM_DELETED: "order.item.deleted",
  SUBSCRIBE_ADMIN: "subscribe:admin",
  UNSUBSCRIBE_ADMIN: "unsubscribe:admin",
} as const;

const SUBSCRIBE_ACK_TIMEOUT_MS = 5_000;

let socket: Socket | null = null;
let socketIdInterceptorInstalled = false;
let socketEpoch = 0;
const epochListeners = new Set<() => void>();
const adminSubscriberCounts = new Map<string, number>();

const notifySubscribeFailure = (storeId: string, reason: string): void => {
  console.warn(
    `[realtime] subscribe:admin 실패 (store=${storeId}, reason=${reason})`
  );
  toast.error("실시간 주문 알림 연결에 실패했어요.", {
    duration: Infinity,
    closeButton: true,
    action: {
      label: "새로고침",
      onClick: () => window.location.reload(),
    },
  });
};

const emitSubscribeAdmin = (s: Socket, storeId: string): void => {
  s.timeout(SUBSCRIBE_ACK_TIMEOUT_MS).emit(
    REALTIME_EVENT.SUBSCRIBE_ADMIN,
    { storeId },
    (error: Error | null, ack?: { ok: boolean }) => {
      if (error) {
        if (!s.connected) return;
        notifySubscribeFailure(storeId, "ack timeout");
        return;
      }
      if (ack?.ok) return;
      notifySubscribeFailure(storeId, "rejected by server");
    }
  );
};

const ensureSocket = (): Socket => {
  if (socket) return socket;
  const s = io(REALTIME_URL, {
    path: REALTIME_PATH,
    withCredentials: true,
    autoConnect: false,
    transports: ["websocket"],
  });
  s.on("connect", () => {
    for (const [storeId, count] of adminSubscriberCounts) {
      if (count > 0) emitSubscribeAdmin(s, storeId);
    }
  });
  socket = s;
  installSocketIdInterceptor();
  return s;
};

function installSocketIdInterceptor(): void {
  if (socketIdInterceptorInstalled) return;
  socketIdInterceptorInstalled = true;
  http.interceptors.request.use((config) => {
    const id = socket?.id;
    if (id) config.headers.set("Socket-Id", id);
    return config;
  });
}

export const getRealtimeSocket = (): Socket => ensureSocket();

export const subscribeAdmin = (storeId: string): void => {
  const next = (adminSubscriberCounts.get(storeId) ?? 0) + 1;
  adminSubscriberCounts.set(storeId, next);
  if (next === 1) {
    const s = ensureSocket();
    if (!s.connected) s.connect();
    else emitSubscribeAdmin(s, storeId);
  }
};

export const getRealtimeSocketEpoch = (): number => socketEpoch;

export const subscribeRealtimeSocketEpoch = (
  listener: () => void
): (() => void) => {
  epochListeners.add(listener);
  return () => {
    epochListeners.delete(listener);
  };
};

export const resetRealtimeSocket = (): void => {
  socket?.disconnect();
  socket = null;
  adminSubscriberCounts.clear();
  socketEpoch += 1;
  for (const listener of epochListeners) listener();
};

export const unsubscribeAdmin = (storeId: string): void => {
  const next = (adminSubscriberCounts.get(storeId) ?? 0) - 1;
  if (next <= 0) {
    adminSubscriberCounts.delete(storeId);
    if (socket?.connected) {
      socket.emit(REALTIME_EVENT.UNSUBSCRIBE_ADMIN, { storeId });
    }
  } else {
    adminSubscriberCounts.set(storeId, next);
  }
};
