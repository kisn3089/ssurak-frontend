"use server";

import { AccessToken } from "@ssurak/api/core/auth/auth.type";
import { httpAuth } from "@ssurak/api/core/auth/httpAuth";
import { setServerCookie } from "./cookies";
import parseCookieFromResponse, {
  setCookieFromResponseHeader,
} from "@ssurak/api/utils/parseCookieFromResponse";
import { getRefreshToken } from "./getRefreshToken";

type RefreshAccessTokenResponse = AccessToken;

/**
 * refresh Token으로 새로운 Access Token 발급
 *
 * @throws {Error} refresh Token이 쿠키에 없거나 요청에 실패할 경우
 */
export async function refreshAccessToken(): Promise<RefreshAccessTokenResponse> {
  const refreshToken = await getRefreshToken();

  /** middleware에서 이미 체크하지만, 안전하게 한 번 더 검사하는 로직 */
  if (!refreshToken) {
    throw new Error("No refresh Token");
  }

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

  return accessTokenByRefreshToken.data;
}
