"use client";

import {
  SidebarTrigger,
  useSidebar,
} from "@ssurak/ui/components/layouts/sidebar";
import { MenuIcon } from "lucide-react";

export default function MobileSidebar() {
  const { isMobile } = useSidebar();
  if (!isMobile) return null;

  return <SidebarTrigger overrideIcon={<MenuIcon />} />;
}
