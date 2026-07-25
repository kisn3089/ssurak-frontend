"use client";

import { Menu } from "@ssurak/api/types/menu/menu.interface";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemTitle,
} from "@ssurak/ui/components/item";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ActivityRender from "@ssurak/ui/components/activity-render/ActivityRender";
import MenuImage from "@/app/stores/[storeId]/(navigator)/menus/components/MenuImage";
import { transCurrencyFormat } from "@ssurak/ui/utils/menu/priceFormatter";

type MenuCardProps = {
  menu: Menu;
  priority?: boolean;
};

export default function MenuCard({ menu, priority = false }: MenuCardProps) {
  const currentPath = usePathname();

  return (
    <Link href={`${currentPath}/${menu.publicId}`}>
      <Item className={`cursor-pointer items-start`}>
        <ItemContent className="gap-0">
          <ItemTitle className="font-bold text-lg">{menu.name}</ItemTitle>
          <ItemFooter className="text-base font-semibold text-primary">
            {transCurrencyFormat(menu.price)}
          </ItemFooter>
          <ActivityRender value={menu.description}>
            {(description) => (
              <ItemDescription className="leading-4 pt-2">
                {description}
              </ItemDescription>
            )}
          </ActivityRender>
        </ItemContent>
        <MenuImage
          src={menu.images?.thumbnail ?? null}
          alt={menu.name}
          size="thumbnail"
          priority={priority}
          className="rounded-xl"
        />
      </Item>
    </Link>
  );
}
