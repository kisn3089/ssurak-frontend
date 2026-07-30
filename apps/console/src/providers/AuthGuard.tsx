"use client";

import { ReactNode, useEffect } from "react";
import { useAuthInfo } from "@ssurak/auth/providers/AuthenticationProvider";
import { isExpired } from "@ssurak/auth/utils/decodedToken";
import { updateAxiosAuthorizationHeader } from "@ssurak/api/core/axios/http";
import { useRouter } from "next/navigation";
import ErrorFallback from "@/app/(navigator)/components/ErrorFallback";

const AUTH_UNAVAILABLE_MESSAGE =
  "로그인 상태를 갱신하지 못했어요. 네트워크를 확인한 뒤 다시 시도해 주세요.";

type AuthGuardProps = {
  accessToken: string | undefined;
  children: ReactNode;
};

/** 서버가 확보한 access 토큰을 클라이언트 메모리에 주입한다. */
export default function AuthGuard({ accessToken, children }: AuthGuardProps) {
  const { authInfo, setAuthInfo } = useAuthInfo();
  const router = useRouter();

  const isUsableToken = !!accessToken && !isExpired(accessToken);

  useEffect(() => {
    if (!accessToken || isExpired(accessToken)) {
      return;
    }

    setAuthInfo({ accessToken });
    updateAxiosAuthorizationHeader(accessToken);
  }, [accessToken, setAuthInfo]);

  if (!isUsableToken) {
    return (
      <ErrorFallback
        error={new Error(AUTH_UNAVAILABLE_MESSAGE)}
        resetErrorBoundary={() => router.refresh()}
      />
    );
  }

  if (!authInfo.accessToken) {
    return null;
  }

  return children;
}
