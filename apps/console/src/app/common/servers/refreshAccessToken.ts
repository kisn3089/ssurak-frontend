"use server";

import { RefreshAccessTokenResult } from "@ssurak/api/core/auth/auth.type";
import { httpAuth } from "@ssurak/api/core/auth/httpAuth";
import { getServerCookie, setServerCookie } from "./cookies";
import parseCookieFromResponse, {
  setCookieFromResponseHeader,
} from "@ssurak/api/utils/parseCookieFromResponse";
import { COOKIE_TABLE } from "@ssurak/api/utils/cookieTable.const";
import { isExpired } from "@ssurak/auth/utils/decodedToken";
import { isAxiosError } from "axios";
import { getAccessToken } from "./getAccessToken";

const SESSION_ENDED_STATUS = [401, 419];

/**
 * 쿠키의 access 토큰을 갱신 없이 재사용하려면 최소 이만큼은 남아 있어야 한다.
 * 백엔드가 방금 419로 거절한 토큰을 Next 서버 시계 기준으로는 아직 유효하다고 보고 되돌려주거나,
 * 재요청·소켓 핸드셰이크 도중 만료되는 경우를 막는다.
 */
const ACCESS_TOKEN_REUSE_LEEWAY_SECONDS = 30;

/**
 * refresh Token으로 새로운 Access Token 발급.
 * 실패해도 던지지 않고 원인을 구분해 반환한다 ({@link RefreshAccessTokenResult}).
 */
export async function refreshAccessToken(): Promise<RefreshAccessTokenResult> {
  const accessToken = await getAccessToken();
  if (
    accessToken &&
    !isExpired(accessToken, ACCESS_TOKEN_REUSE_LEEWAY_SECONDS)
  ) {
    return { status: "refreshed", accessToken };
  }

  /** 토큰 값은 서버 안에서만 다루고, 클라이언트로는 절대 반환하지 않는다. */
  const refreshToken = (await getServerCookie(COOKIE_TABLE.REFRESH))?.value;

  if (!refreshToken) {
    return { status: "unauthorized" };
  }

  try {
    const accessTokenByRefreshToken =
      await httpAuth.refreshAccessToken(refreshToken);

    const cookieFromResponseHeader =
      accessTokenByRefreshToken.headers["set-cookie"];
    if (cookieFromResponseHeader) {
      const responseCookies = parseCookieFromResponse(cookieFromResponseHeader);
      await setCookieFromResponseHeader(
        responseCookies,
        async ({ name, value, expires, maxAge, path }) => {
          await setServerCookie(name, value, { expires, maxAge, path });
        }
      );
    }

    return {
      status: "refreshed",
      accessToken: accessTokenByRefreshToken.data.accessToken,
    };
  } catch (error: unknown) {
    const status = isAxiosError(error) ? error.response?.status : undefined;

    if (status !== undefined && SESSION_ENDED_STATUS.includes(status)) {
      return { status: "unauthorized" };
    }

    console.error("[refreshAccessToken] Failed to refresh access token", error);
    return { status: "unavailable" };
  }
}
