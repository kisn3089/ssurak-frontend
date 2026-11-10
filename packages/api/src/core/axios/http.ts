import axios, { AxiosError, AxiosRequestConfig } from "axios";
import type { RefreshAccessTokenResult } from "../auth/auth.type";

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: HttpAxiosError;
  }
}

declare module "axios" {
  interface AxiosRequestConfig {
    /** 419 갱신 후 이미 한 번 재시도한 요청인지. 재시도에서도 419가 나면 더 갱신하지 않는다. */
    hasRetriedAfterRefresh?: boolean;
  }
}

const isServer = typeof window === "undefined";

export const resolveSsurakBaseURL = (): string => {
  if (process.env.NODE_ENV !== "production") {
    if (isServer) {
      return (
        process.env.NEXT_PUBLIC_SSURAK_INTERNAL_URL || "http://localhost:8080"
      );
    }
    // dev 브라우저: 호스트에서 접근하므로 현재 호스트명 기준으로 해석.
    return `${window.location.protocol}//${window.location.hostname}:8080`;
  }
  return process.env.NEXT_PUBLIC_API_SSURAK_URL || "http://localhost:8080";
};

export const http = axios.create({
  baseURL: resolveSsurakBaseURL(),
  timeout: 10000,
  withCredentials: true,
});

/** 서버 사이드에서 실행하지 말 것 */
export function updateAxiosAuthorizationHeader(token: string) {
  http.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

type HttpError = {
  code: string;
  message: string;
  error: string;
  status: number;
  path: string;
  timestamp: string;
  details?: Record<string, string | string[] | undefined> | null;
};

export type HttpAxiosError = AxiosError<HttpError, AxiosRequestConfig>;

type AuthCallbacks = {
  refreshAccessToken: () => Promise<RefreshAccessTokenResult>;
  setAuthInfo: (authInfo: { accessToken: string }) => void;
  signOut: () => void;
  forbiddenNotice: () => void;
};

let authCallbacks: AuthCallbacks | null = null;

export function setupAuthInterceptor(callbacks: AuthCallbacks) {
  authCallbacks = callbacks;
}

let refreshPromise: Promise<RefreshAccessTokenResult> | null = null;

function refreshAccessTokenOnce(
  callbacks: AuthCallbacks
): Promise<RefreshAccessTokenResult> {
  if (!refreshPromise) {
    refreshPromise = callbacks
      .refreshAccessToken()
      // 갱신 요청 자체가 닿지 못한 경우(오프라인 등)도 세션 파기로 몰지 않는다.
      .catch((error: unknown): RefreshAccessTokenResult => {
        console.error("[http] Failed to reach the refresh endpoint", error);
        return { status: "unavailable" };
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/** 갱신 결과를 메모리 토큰·axios 헤더에 반영하고, 세션이 끝났으면 로그아웃한다. */
async function refreshAndApply(
  callbacks: AuthCallbacks
): Promise<RefreshAccessTokenResult> {
  const refreshed = await refreshAccessTokenOnce(callbacks);

  if (refreshed.status === "refreshed") {
    callbacks.setAuthInfo({ accessToken: refreshed.accessToken });
    updateAxiosAuthorizationHeader(refreshed.accessToken);
  }

  if (refreshed.status === "unauthorized") {
    callbacks.signOut();
  }

  return refreshed;
}

/**
 * 419 인터셉터 밖에서 토큰을 갱신한다 (소켓 핸드셰이크 거절 등).
 * 인터셉터와 같은 갱신 Promise를 공유하므로 동시에 불려도 refresh 토큰은 한 번만 회전한다.
 */
export function refreshAuthSession(): Promise<RefreshAccessTokenResult> {
  if (!authCallbacks) return Promise.resolve({ status: "unavailable" });
  return refreshAndApply(authCallbacks);
}

http.interceptors.response.use(
  undefined,
  async (error: AxiosError<HttpError, AxiosRequestConfig>) => {
    if (error instanceof AxiosError && error.config) {
      /**
       * 갱신이 쿠키의 아직 유효한 access 토큰을 그대로 돌려줄 수 있어서(서버 간 시계 오차 등),
       * 재시도에서도 419가 나면 같은 토큰으로 무한히 재시도하지 않도록 한 번만 허용한다.
       */
      if (
        error.response?.status === 419 &&
        !error.config.hasRetriedAfterRefresh &&
        authCallbacks
      ) {
        const refreshed = await refreshAndApply(authCallbacks);

        if (refreshed.status === "refreshed") {
          error.config.hasRetriedAfterRefresh = true;
          error.config.headers["Authorization"] =
            `Bearer ${refreshed.accessToken}`;
          return http(error.config);
        }
      }

      if (
        error.response?.status === 403 &&
        !error.config.url?.includes("/refresh") &&
        authCallbacks
      ) {
        authCallbacks.forbiddenNotice();
      }
    }

    return Promise.reject(error);
  }
);
