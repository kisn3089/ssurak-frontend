"use client";

import { CardHeader } from "@ssurak/ui/components/layouts/card";
import type { CartItem } from "@ssurak/api/types/cart/cart.interface";
import MenuImage from "@/app/stores/[storeId]/(navigator)/menus/components/MenuImage";
import { useCart } from "./CartProvider";
import CartMenuContent from "./CartMenuContent";
import DeleteMenuButton from "./DeleteMenuButton";
import MenuCounter from "@ssurak/ui/components/menu/menu-detail/MenuCounter";

type CartMenuProps = {
  menu: CartItem;
};

export default function CartMenu({ menu }: CartMenuProps) {
  const { actions } = useCart();

  return (
    <CardHeader className="flex flex-row gap-x-4 p-4">
      <MenuImage
        src={menu.menuImageUrl}
        alt={menu.menuName}
        size="thumbnail"
        className="rounded-xl"
      />
      <div className="w-full">
        <div className="flex justify-between w-full">
          <CartMenuContent menu={menu} />
          <DeleteMenuButton menuId={menu.id} />
        </div>
        <div className="flex justify-end pt-3">
          <MenuCounter
            quantity={menu.quantity}
            changeQuantity={(newQuantity) =>
              actions.changeQuantity(menu.id, newQuantity)
            }
          />
        </div>
      </div>
    </CardHeader>
  );
}
