export type AccessToken = {
  accessToken: string;
  expiresAt: Date;
};

export type SignInPayload = {
  email: string;
  password: string;
};

export type RefreshAccessTokenResult =
  /** refresh 토큰이 만료·무효·폐기됐다. 세션이 끝났으니 쿠키를 지우고 재로그인해야 한다. */
  | { status: "unauthorized" }
  /** 네트워크·타임아웃·서버 오류. 세션은 살아 있을 수 있으니 쿠키를 지우지 않는다. */
  | { status: "unavailable" }
  | { status: "refreshed"; accessToken: string };
