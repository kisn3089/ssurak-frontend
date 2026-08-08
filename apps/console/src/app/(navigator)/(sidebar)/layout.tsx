import NavSidebar from "./components/NavSidebar";
import AuthGuard from "@/providers/AuthGuard";
import { getAccessToken } from "@/app/common/servers/getAccessToken";
import ServerPrefetch from "@/app/(navigator)/components/ServerPrefetch";
import OrderNoticeDaemon from "@/app/(navigator)/(sidebar)/components/realtime/OrderNoticeDaemon";

export default async function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const accessToken = await getAccessToken();

  return (
    <section className="antialiased flex w-full flex-1">
      <AuthGuard accessToken={accessToken}>
        <ServerPrefetch url="/identity/v1/me" shouldSuccess>
          <ServerPrefetch url="/stores/v1">
            <NavSidebar />
            <main className="w-full">{children}</main>
            <OrderNoticeDaemon />
          </ServerPrefetch>
        </ServerPrefetch>
      </AuthGuard>
    </section>
  );
}
