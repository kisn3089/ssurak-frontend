import { ItemContent, ItemFooter, ItemTitle } from "@ssurak/ui/components/item";
import { transCurrencyFormat } from "@ssurak/ui/utils/menu/priceFormatter";
import { DetailMenu } from "./menu-detail.type";

type MenuContentProps = {
  menu: DetailMenu;
  description?: React.ReactNode;
  children: React.ReactNode;
};
export default function MenuContent({
  menu,
  description,
  children,
}: MenuContentProps) {
  return (
    <ItemContent className="w-full px-2">
      <ItemTitle className="font-bold text-xl">{menu.name}</ItemTitle>
      {description}
      <ItemFooter className="text-xl font-semibold text-primary py-2">
        {transCurrencyFormat(menu.price)}
        {children}
      </ItemFooter>
    </ItemContent>
  );
}
