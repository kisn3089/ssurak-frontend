import { CardContent, CardTitle } from "@ssurak/ui/components/layouts/card";
import CartMenuOptions from "./CartMenuOptions";
import { CartItem } from "@ssurak/api/types/cart/cart.interface";
import { transCurrencyFormat } from "@ssurak/ui/utils/menu/priceFormatter";

export default function CartMenuContent({ menu }: { menu: CartItem }) {
  return (
    <div className="flex flex-col">
      <CardTitle className="text-lg flex-1">{menu.menuName}</CardTitle>
      <CardContent className="p-0 font-semibold">
        {transCurrencyFormat(menu.unitPrice)}
      </CardContent>
      <CartMenuOptions options={menu.options} />
    </div>
  );
}
