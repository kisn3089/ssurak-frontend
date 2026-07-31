"use server";

import { RefreshAccessTokenResult } from "@ssurak/api/core/auth/auth.type";
import { httpAuth } from "@ssurak/api/core/auth/httpAuth";
import { getServerCookie, setServerCookie } from "./cookies";
import parseCookieFromResponse, {
  setCookieFromResponseHeader,
} from "@ssurak/api/utils/parseCookieFromResponse";
import { COOKIE_TABLE } from "@ssurak/api/utils/cookieTable.const";
import { isAxiosError } from "axios";

const SESSION_ENDED_STATUS = [401, 419];

/**
 * refresh Token으로 새로운 Access Token 발급.
 * 실패해도 던지지 않고 원인을 구분해 반환한다 ({@link RefreshAccessTokenResult}).
 */
export async function refreshAccessToken(): Promise<RefreshAccessTokenResult> {
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
        async ({ name, value, expires }) => {
          await setServerCookie(name, value, { expires });
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
