"use server";

import { AxiosError } from "axios";
import { AccessToken, SignInPayload } from "@ssurak/api/core/auth/auth.type";
import { httpAuth } from "@ssurak/api/core/auth/httpAuth";
import parseCookieFromResponse, {
  setCookieFromResponseHeader,
} from "@ssurak/api/utils/parseCookieFromResponse";
import { setServerCookie } from "@/app/common/servers/cookies";

type ActionResponse =
  | {
      success: true;
      data: AccessToken;
    }
  | {
      success: false;
      error: {
        message: string;
        statusCode?: number;
      };
    };

export default async function signInAction({
  email,
  password,
}: SignInPayload): Promise<ActionResponse> {
  try {
    if (typeof email !== "string" || typeof password !== "string") {
      return {
        success: false,
        error: { message: "이메일과 비밀번호를 모두 입력해주세요." },
      };
    }

    const createdAccessToken = await httpAuth.createAccessToken(
      {
        email,
        password,
      },
      "owner"
    );

    const cookieFromResponseHeader = createdAccessToken.headers["set-cookie"];
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
      success: true,
      data: createdAccessToken.data,
    };
  } catch (error) {
    const errorResponse: ActionResponse = {
      success: false,
      error: { message: "로그인 시 서버 오류가 발생했습니다." },
    };

    if (error instanceof AxiosError) {
      if (error.response?.data?.statusCode === 401) {
        errorResponse["error"].message =
          error.response?.data?.message ||
          "이메일 또는 비밀번호가 올바르지 않습니다.";
        return errorResponse;
      }
      return errorResponse;
    }
    return errorResponse;
  }
}
