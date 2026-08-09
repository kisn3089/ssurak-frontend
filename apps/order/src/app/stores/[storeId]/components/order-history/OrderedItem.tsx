import { OrderItem } from "@ssurak/api/types/orderItem/orderItem.interface";
import {
  Item,
  ItemContent,
  ItemFooter,
  ItemTitle,
} from "@ssurak/ui/components/item";
import MenuImage from "../../(navigator)/menus/components/MenuImage";
import { transCurrencyFormat } from "@ssurak/ui/utils/menu/priceFormatter";
import OptionTags from "@ssurak/ui/components/menu/options/OptionTags";

export default function OrderedItem({ orderItem }: { orderItem: OrderItem }) {
  return (
    <Item className="p-0 pb-2 w-full">
      <MenuImage
        src={orderItem.menuImageUrl}
        alt={orderItem.menuName}
        size="thumbnail"
        className="rounded-xl"
      />
      <ItemContent>
        <ItemTitle className="font-bold text-lg">
          {orderItem.menuName}
        </ItemTitle>
        <ItemFooter className="basis-auto">
          <div className="flex gap-x-1">
            <span className="text-muted-foreground">{`${transCurrencyFormat(orderItem.unitPrice)} x`}</span>
            <span className="font-semibold">{orderItem.quantity}</span>
          </div>
        </ItemFooter>
        <OptionTags
          options={orderItem.optionsSnapshot?.options}
          variant="secondary"
        />
      </ItemContent>
      <div className="font-bold">
        {transCurrencyFormat(orderItem.unitPrice * orderItem.quantity)}
      </div>
    </Item>
  );
}
