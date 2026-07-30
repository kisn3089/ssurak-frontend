import { SidebarProvider } from "@ssurak/ui/components/layouts/sidebar";
import { cookies } from "next/headers";
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
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  const accessToken = await getAccessToken();

  return (
    <section className="antialiased">
      <AuthGuard accessToken={accessToken}>
        <ServerPrefetch url="/identity/v1/me" shouldSuccess>
          <ServerPrefetch url="/stores/v1">
            <SidebarProvider defaultOpen={defaultOpen}>
              <NavSidebar />
              <main className="w-full">{children}</main>
              <OrderNoticeDaemon />
            </SidebarProvider>
          </ServerPrefetch>
        </ServerPrefetch>
      </AuthGuard>
    </section>
  );
}
