"use client";

import React, { ReactNode, useEffect } from "react";
import { refreshAccessToken } from "../app/common/servers/refreshAccessToken";
import { useAuthInfo } from "@ssurak/auth/providers/AuthenticationProvider";
import { isExpired } from "@ssurak/auth/utils/decodedToken";
import { getAccessToken } from "@/app/common/servers/getAccessToken";
import { useQueryClient } from "@tanstack/react-query";
import { updateAxiosAuthorizationHeader } from "@ssurak/api/core/axios/http";
import { getRefreshToken } from "@/app/common/servers/getRefreshToken";

type AuthGuardProps = {
  children: ReactNode;
};
export default function AuthGuard({ children }: AuthGuardProps) {
  const { authInfo, setAuthInfo, signOut } = useAuthInfo();
  const queryClient = useQueryClient();

  useEffect(() => {
    const signOutWithCacheClear = () => {
      queryClient.clear();
      signOut();
    };

    (async () => {
      const accessToken = await getAccessToken();

      if (accessToken && !isExpired(accessToken)) {
        setAuthInfo({ accessToken });
        updateAxiosAuthorizationHeader(accessToken);
        return;
      }

      if (!accessToken) {
        signOutWithCacheClear();
        return;
      }

      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        signOutWithCacheClear();
        return;
      }

      try {
        console.info("[AuthGuard] Refreshed access token...");
        const refreshedAccessToken = await refreshAccessToken();
        setAuthInfo({ accessToken: refreshedAccessToken.accessToken });
      } catch (error: unknown) {
        console.error("[AuthGuard] Failed to refresh access token", error);
        signOutWithCacheClear();
      }
    })();
  }, [queryClient, setAuthInfo, signOut]);

  if (!authInfo.accessToken) {
    return null;
  }

  return children;
}
