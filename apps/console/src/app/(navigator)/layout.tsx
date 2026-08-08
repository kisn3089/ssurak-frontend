import TextLogo from "@ssurak/ui/components/TextLogo";
import { ToggleTheme } from "@ssurak/ui/components/theme/ToggleTheme";
import Link from "next/link";
import MobileSidebar from "./(sidebar)/components/MobileSidebar";
import { SidebarProvider } from "@ssurak/ui/components/layouts/sidebar";
import { cookies } from "next/headers";

export default async function NavigatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <section className="antialiased">
      <SidebarProvider defaultOpen={defaultOpen} className="flex-col">
        <header className="sticky top-0 bg-background z-20 flex justify-between px-3 items-center w-screen h-14 md:px-6">
          <div className="flex gap-x-2 items-center">
            <MobileSidebar />
            <Link href="/" className="font-bold text-lg hidden md:block">
              <TextLogo />
            </Link>
          </div>
          <div className="flex flex-row items-center gap-4">
            <ToggleTheme />
          </div>
        </header>
        {children}
      </SidebarProvider>
    </section>
  );
}
