"use client";

import { useParams } from "next/navigation";
import { Menu } from "@ssurak/api/types/menu/menu.interface";
import { StoreContextResponse } from "@ssurak/api/types/store/store.interface";
import useSuspenseWithSession from "@ssurak/api/hooks/useSuspenseWithSession";
import MenuDetailAddCart from "./components/MenuDetailAddCart";
import { MenuDetail } from "@ssurak/ui/components/menu/menu-detail";
import MenuImage from "@/app/stores/[storeId]/(navigator)/menus/components/MenuImage";
import { ItemDescription } from "@ssurak/ui/components/item";

export default function MenuDetailPage() {
  const { menuId } = useParams<{ menuId: string }>();

  const { data: menu } = useSuspenseWithSession<
    StoreContextResponse,
    Menu | undefined
  >("/stores/v1/sessions/me/store-context", {
    queryOptions: {
      select: (storeContext) =>
        storeContext.table.store.categories
          .flatMap((category) => category.menus)
          .find((candidate) => candidate.publicId === menuId),
    },
  });

  if (!menu) {
    throw new Error("메뉴를 찾을 수 없습니다.");
  }

  const detailMenu = { ...menu, images: menu.images?.hero ?? null };

  return (
    <MenuDetail.Provider menu={detailMenu}>
      <main className="bg-accent flex flex-col gap-y-2">
        <MenuDetail.Info
          className="bg-background"
          description={
            <ItemDescription className="text-base line-clamp-none">
              {menu.description}
            </ItemDescription>
          }
        >
          <MenuImage
            src={menu.images?.hero ?? "/images/default-menu-image.png"}
            priority={true}
            alt={menu.name}
            size="cover"
            className="rounded-3xl"
          />
        </MenuDetail.Info>
        <section
          className="bg-white py-4 pb-[81px]"
          aria-label="메뉴 옵션 선택"
        >
          <MenuDetail.RequiredOptions />
          <MenuDetail.CustomOptions />
        </section>
        <MenuDetailAddCart />
      </main>
    </MenuDetail.Provider>
  );
}
