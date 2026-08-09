"use client";

import { Menu } from "@ssurak/api/types/menu/menu.interface";
import { transCurrencyFormat } from "@ssurak/ui/utils/menu/priceFormatter";
import EntityListView, {
  EntityRow,
} from "../../components/table-view/table/EntityListView";
import useMenuMutation from "@ssurak/api/core/store/menu/useMenuMutation";
import { httpMenuErrors } from "@ssurak/api/core/store/menu/httpMenuErrors";
import { useParams } from "next/navigation";
import { activeBadge } from "../../components/table-view/table/activate-badge.const";

interface MenuListViewProps {
  menuList: Menu[];
}

export default function MenuListView({ menuList }: MenuListViewProps) {
  const { storeId } = useParams<{ storeId: string }>();
  const { updateMenu, deleteMenu } = useMenuMutation(storeId);

  const updateActivate = async (publicId: string, isActive: boolean) => {
    await updateMenu.mutateAsync({
      menuId: publicId,
      updateMenuPayload: { isAvailable: isActive },
    });
  };

  const deleteAction = async (publicId: string) => {
    await deleteMenu.mutateAsync({ menuId: publicId });
  };

  const toRow = (menu: Menu): EntityRow => ({
    publicId: menu.publicId,
    isActive: menu.isAvailable,
    name: menu.name,
    // 옵션은 메뉴 응답에 실리지 않는다. 메뉴 상세 화면의 옵션 관리에서 확인·수정한다.
    cells: [{ content: transCurrencyFormat(menu.price) }],
  });

  return (
    <EntityListView
      list={menuList}
      toRow={toRow}
      hrefPrefix="menus"
      toastPrefix="메뉴"
      mutation={{ updateActivate, deleteAction }}
      httpErrors={httpMenuErrors}
      activeBadge={activeBadge(["판매중", "미판매중"])}
    />
  );
}
