"use client";

import AuthenticationProvider from "@ssurak/auth/providers/AuthenticationProvider";
import { useRouter } from "next/navigation";
import AxiosInterceptor from "@/lib/AxiosInterceptor";
import { clearServerCookie } from "@/app/common/servers/cookies";
import { COOKIE_TABLE } from "@ssurak/api/utils/cookieTable.const";

export function ConsoleAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const signOut = () => {
    void (async () => {
      try {
        await clearServerCookie([
          COOKIE_TABLE.ACCESS_TOKEN,
          COOKIE_TABLE.REFRESH,
        ]);
      } catch (error) {
        console.error("Error occurred while clearing cookies:", error);
      } finally {
        router.push("/signin");
      }
    })();
  };

  return (
    <AuthenticationProvider serverSignOut={signOut}>
      <AxiosInterceptor>{children}</AxiosInterceptor>
    </AuthenticationProvider>
  );
}
