import {
  http,
  refreshAuthSession,
  resolveSsurakBaseURL,
} from "@ssurak/api/core/axios/http";
import { toast } from "@ssurak/ui/components/sonner";
import { io, Socket } from "socket.io-client";

const REALTIME_URL = `${resolveSsurakBaseURL()}/events`;
const REALTIME_PATH = "/ws/";

/** 백엔드 RealtimeGateway 인증 미들웨어가 핸드셰이크를 거절할 때 보내는 메시지 */
const HANDSHAKE_UNAUTHORIZED = "unauthorized";

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
/** 핸드셰이크 거절 → 갱신 → 재연결을 이미 시도했는지. 연결에 성공하거나 사용자가 다시 연결을 누르면 초기화한다. */
let handshakeRefreshAttempted = false;
const epochListeners = new Set<() => void>();
const resyncListeners = new Set<(storeId: string) => void>();
const adminSubscriberCounts = new Map<string, number>();

export type RealtimeConnectionStatus =
  | "connected"
  | "connecting"
  | "disconnected"
  | "failed";

let connectionStatus: RealtimeConnectionStatus = "disconnected";
const connectionStatusListeners = new Set<() => void>();

const setConnectionStatus = (next: RealtimeConnectionStatus): void => {
  if (connectionStatus === next) return;
  connectionStatus = next;
  for (const listener of connectionStatusListeners) listener();
};

export const getRealtimeConnectionStatus = (): RealtimeConnectionStatus =>
  connectionStatus;

export const subscribeRealtimeConnectionStatus = (
  listener: () => void
): (() => void) => {
  connectionStatusListeners.add(listener);
  return () => {
    connectionStatusListeners.delete(listener);
  };
};

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

/**
 * @param shouldResync 끊겨 있던 동안 놓친 이벤트가 있을 수 있는 구독인지.
 * room에 들어간 뒤에 재동기화해야 조회와 구독 사이에 도착한 이벤트도 놓치지 않는다.
 */
const emitSubscribeAdmin = (
  s: Socket,
  storeId: string,
  shouldResync = false
): void => {
  s.timeout(SUBSCRIBE_ACK_TIMEOUT_MS).emit(
    REALTIME_EVENT.SUBSCRIBE_ADMIN,
    { storeId },
    (error: Error | null, ack?: { ok: boolean }) => {
      if (error) {
        if (!s.connected) return;
        notifySubscribeFailure(storeId, "ack timeout");
        return;
      }
      if (ack?.ok) {
        if (shouldResync) {
          for (const listener of resyncListeners) listener(storeId);
        }
        return;
      }
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

  /**
   * 연결이 끊겼거나 연결 시도가 실패한 적이 있는지.
   * 재동기화를 Manager의 reconnect 이벤트가 아니라 여기에 묶는 이유:
   * reconnect는 전송 계층이 다시 열리는 순간(네임스페이스 인증 전) 발생해 거절될 연결에서도 재조회를 일으키고,
   * 갱신 후 재연결·다시 연결 버튼처럼 connect()로 새로 여는 경로에서는 아예 발생하지 않는다.
   */
  let interrupted = false;

  s.on("connect", () => {
    handshakeRefreshAttempted = false;
    setConnectionStatus("connected");
    const shouldResync = interrupted;
    interrupted = false;
    for (const [storeId, count] of adminSubscriberCounts) {
      if (count > 0) emitSubscribeAdmin(s, storeId, shouldResync);
    }
  });

  s.on("disconnect", () => {
    interrupted = true;
    setConnectionStatus(s.active ? "connecting" : "failed");
  });
  s.on("connect_error", (error) => {
    interrupted = true;
    if (!s.active && error.message === HANDSHAKE_UNAUTHORIZED) {
      void reconnectWithRefreshedToken(s);
      return;
    }
    setConnectionStatus(s.active ? "connecting" : "failed");
  });
  s.io.on("reconnect_attempt", () => setConnectionStatus("connecting"));
  s.io.on("reconnect_failed", () => setConnectionStatus("failed"));

  socket = s;
  installSocketIdInterceptor();
  return s;
};

/**
 * 핸드셰이크 인증은 연결 시점에 쿠키의 access 토큰으로만 이뤄지고, 소켓에는 토큰을 갱신할 경로가 없다.
 * 그래서 탭이 쉬는 동안 access가 만료된 뒤 연결이 끊기면, 재연결은 만료된 쿠키로 거절당해 failed에 멈춘다.
 * 거절되면 REST 인터셉터와 같은 갱신을 한 번 거쳐 새 쿠키로 다시 연결한다.
 * 갱신 직후에도 거절되면 토큰 문제가 아니므로 반복하지 않고 failed로 둔다.
 */
async function reconnectWithRefreshedToken(s: Socket): Promise<void> {
  if (handshakeRefreshAttempted) {
    setConnectionStatus("failed");
    return;
  }
  handshakeRefreshAttempted = true;
  setConnectionStatus("connecting");

  const refreshed = await refreshAuthSession();

  /** 세션이 끝났으면 refreshAuthSession이 signOut → resetRealtimeSocket으로 상태와 인스턴스를 정리한다 */
  if (refreshed.status === "unauthorized") return;

  /** 갱신을 기다리는 사이 로그아웃·재로그인으로 인스턴스가 교체됐다면 버려진 소켓을 되살리지 않는다 */
  if (socket !== s) return;

  if (refreshed.status === "refreshed") {
    s.connect();
    return;
  }
  setConnectionStatus("failed");
}

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

/**
 * failed 상태에서 빠져나오는 유일한 경로다.
 * subscribeAdmin은 구독 카운트가 0→1로 바뀔 때만 connect()를 호출하므로,
 * 데몬이 마운트된 채(카운트 ≥ 1) 소켓이 죽으면 자동 재시도가 일어나지 않는다.
 *
 * 인스턴스를 교체하지 않고 같은 소켓을 되살린다. socket.io의 connect()는 destroy()가
 * 비워둔 subs를 subEvents()로 다시 채우고 매니저의 skipReconnect도 해제하는데,
 * 데몬들이 socket.on(...)으로 등록한 주문 이벤트 핸들러는 emitter에 그대로 남아 있다.
 * 재연결에 성공하면 connect 핸들러가 보유 중인 room을 다시 구독한다.
 */
export const reconnectRealtime = (): void => {
  const s = ensureSocket();
  if (s.connected) return;
  handshakeRefreshAttempted = false;
  setConnectionStatus("connecting");
  s.connect();
};

/**
 * 끊겼던 연결이 복구되어 매장 room에 다시 들어간 직후 호출된다.
 * 끊겨 있던 동안 놓친 이벤트를 메우기 위해 해당 매장 데이터를 다시 조회하는 데 쓴다.
 */
export const subscribeRealtimeResync = (
  listener: (storeId: string) => void
): (() => void) => {
  resyncListeners.add(listener);
  return () => {
    resyncListeners.delete(listener);
  };
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
  handshakeRefreshAttempted = false;
  adminSubscriberCounts.clear();
  setConnectionStatus("disconnected");
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
