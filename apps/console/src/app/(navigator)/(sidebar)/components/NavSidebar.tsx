import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@ssurak/ui/components/layouts/sidebar";
import SidebarGroups from "./SidebarItemGroups";
import SidebarFooterLayout from "./SidebarFooterLayout";
import StoreSwitcher from "./StoreSwitcher";

export default function NavSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <StoreSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroups />
      </SidebarContent>
      <SidebarFooter className="pb-2">
        <SidebarFooterLayout />
      </SidebarFooter>
    </Sidebar>
  );
}
