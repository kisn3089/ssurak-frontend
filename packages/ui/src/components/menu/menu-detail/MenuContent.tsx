import { ItemContent, ItemFooter, ItemTitle } from "@ssurak/ui/components/item";
import { transCurrencyFormat } from "@ssurak/ui/utils/menu/priceFormatter";
import { useMenuDetailContext } from "./MenuDetailContext";

type MenuContentProps = {
  description?: React.ReactNode;
  children: React.ReactNode;
};
export default function MenuContent({
  description,
  children,
}: MenuContentProps) {
  const {
      state: { menu },
      meta: { price },
    } = useMenuDetailContext();
    
  return (
    <ItemContent className="w-full px-2">
      <ItemTitle className="font-bold text-xl">{menu.name}</ItemTitle>
      {description}
      <ItemFooter className="text-xl font-semibold text-primary py-2">
        {transCurrencyFormat(price)}
        {children}
      </ItemFooter>
    </ItemContent>
  );
}
