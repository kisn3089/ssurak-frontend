import { httpAuth } from "@ssurak/api/core/auth/httpAuth";
import parseCookieFromResponse from "@ssurak/api/utils/parseCookieFromResponse";
import { isExpired } from "@ssurak/auth/utils/decodedToken";
import { COOKIE_TABLE } from "@ssurak/api/utils/cookieTable.const";
import { NextRequest, NextResponse } from "next/server";
import { cookieOptions } from "../utils/cookieOptions";
import { isAxiosError } from "axios";

/** refresh 토큰 자체가 거절된 상태. 이 외의 실패는 세션이 끝났다는 뜻이 아니다. */
const SESSION_ENDED_STATUS = [401, 419];

/** `<Link>` 프리페치가 붙이는 헤더. Next가 RSC 프리페치 요청에만 넣는다. */
const PREFETCH_HEADER = "next-router-prefetch";

export async function proxy(req: NextRequest) {
  const refreshToken = req.cookies.get(COOKIE_TABLE.REFRESH);
  const accessToken = req.cookies.get(COOKIE_TABLE.ACCESS_TOKEN);

  if (!refreshToken || isExpired(refreshToken.value)) {
    console.log("[proxy] expired refresh token go to signin...");
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  if (accessToken && !isExpired(accessToken.value)) {
    return NextResponse.next();
  }

  if (req.headers.has(PREFETCH_HEADER)) {
    return NextResponse.next();
  }

  console.log("[proxy] refresh access token...");
  try {
    const refreshed = await httpAuth.refreshAccessToken(refreshToken.value);
    const setCookieHeader = refreshed.headers["set-cookie"];

    if (!setCookieHeader) {
      return NextResponse.next();
    }

    const responseCookies = parseCookieFromResponse(setCookieHeader);

    for (const { name, value } of responseCookies) {
      req.cookies.set(name, value);
    }

    const res = NextResponse.next({ request: { headers: req.headers } });

    for (const { name, value, expires, maxAge } of responseCookies) {
      res.cookies.set(name, value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        ...cookieOptions,
        expires,
        maxAge,
      });
    }

    return res;
  } catch (error: unknown) {
    const status = isAxiosError(error) ? error.response?.status : undefined;

    if (status !== undefined && SESSION_ENDED_STATUS.includes(status)) {
      console.log("[proxy] refresh token was rejected. go to signin...");
      return NextResponse.redirect(new URL("/signin", req.url));
    }

    console.error("[proxy] failed to refresh access token", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!signin|_next|favicon.ico|icon.png|apple-icon.png).*)"],
};
