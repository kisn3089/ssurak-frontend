import axios, { AxiosError, AxiosRequestConfig } from "axios";
import type { RefreshAccessTokenResult } from "../auth/auth.type";

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: HttpAxiosError;
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

http.interceptors.response.use(
  undefined,
  async (error: AxiosError<HttpError, AxiosRequestConfig>) => {
    if (error instanceof AxiosError && error.config) {
      if (error.response?.status === 419 && authCallbacks) {
        const refreshed = await refreshAccessTokenOnce(authCallbacks);

        if (refreshed.status === "refreshed") {
          authCallbacks.setAuthInfo({ accessToken: refreshed.accessToken });
          updateAxiosAuthorizationHeader(refreshed.accessToken);

          error.config.headers["Authorization"] =
            `Bearer ${refreshed.accessToken}`;
          return http(error.config);
        }

        if (refreshed.status === "unauthorized") {
          authCallbacks.signOut();
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
