"use client";

import { Menu } from "@ssurak/api/types/menu/menu.interface";
import { transCurrencyFormat } from "@ssurak/ui/utils/menu/priceFormatter";
import { Badge } from "@ssurak/ui/components/forms/badge";
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
    cells: [
      { content: transCurrencyFormat(menu.price) },
      {
        content: <MenuOptionBadges menu={menu} />,
        overwriteOverflow: "flex flex-wrap gap-1",
      },
    ],
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

function MenuOptionBadges({ menu }: { menu: Menu }) {
  const requiredOptions = Object.keys(menu.requiredOptions ?? {});
  const customOptions = Object.keys(menu.customOptions ?? {});

  return (
    <>
      {requiredOptions.map((option) => (
        <Badge key={option} variant="destructive">
          {option}
        </Badge>
      ))}
      {customOptions.map((option) => (
        <Badge key={option} variant="secondary">
          {option}
        </Badge>
      ))}
    </>
  );
}
