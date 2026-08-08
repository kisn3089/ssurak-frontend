"use client";

import useQueryWithAuth from "@ssurak/api/hooks/useQueryWithAuth";
import type { Store } from "@ssurak/api/types/store/store.interface";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@ssurak/ui/components/forms/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@ssurak/ui/components/layouts/sidebar";
import { ChevronsUpDown, Store as StoreIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function StoreSwitcher() {
  const router = useRouter();
  const { storeId } = useParams<{ storeId: string }>();
  const { isMobile, toggleSidebar } = useSidebar();

  const { data: stores } = useQueryWithAuth<Store[]>("/stores/v1");

  const currentStore = stores?.find((store) => store.publicId === storeId);
  const hasMultipleStores = (stores?.length ?? 0) > 1;

  const handleSelect = (nextStoreId: string) => {
    if (nextStoreId !== storeId) {
      router.push(`/${nextStoreId}/orders`);
    }
  };

  const trigger = (
    <SidebarMenuButton
      size="sm"
      className={`h-10 rounded-lg transition-all duration-75 ${hasMultipleStores ? "" : "pointer-events-none"}`}
    >
      <div className="flex aspect-square items-center justify-center">
        <StoreIcon className="size-4" />
      </div>
      <span className="truncate text-sm font-semibold">
        {currentStore?.name ?? "매장 선택"}
      </span>
      {hasMultipleStores && <ChevronsUpDown className="ml-auto size-4" />}
    </SidebarMenuButton>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {hasMultipleStores ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width)"
              align="start"
            >
              <DropdownMenuRadioGroup
                value={storeId}
                onValueChange={handleSelect}
              >
                {stores?.map((store) => (
                  <DropdownMenuRadioItem
                    key={store.publicId}
                    value={store.publicId}
                    onClick={() => isMobile && toggleSidebar()}
                  >
                    {store.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          trigger
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
