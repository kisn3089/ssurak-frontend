import { OrderItem } from "@ssurak/api/types/orderItem/orderItem.interface";
import {
  Item,
  ItemContent,
  ItemFooter,
  ItemTitle,
} from "@ssurak/ui/components/item";
import MenuImage from "../../(navigator)/menus/components/MenuImage";
import { transCurrencyFormat } from "@ssurak/ui/utils/menu/priceFormatter";
import { Badge } from "@ssurak/ui/components/forms/badge";

export default function OrderedItem({ orderItem }: { orderItem: OrderItem }) {
  const options = Object.values(orderItem.optionsSnapshot ?? {}).flatMap(
    (option) => Object.entries(option)
  );

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
        <div className="flex flex-wrap gap-1">
          {options.map(([key, option], index) => (
            <Badge key={index} variant={"secondary"}>
              {`${key} - ${option.key}`}
            </Badge>
          ))}
        </div>
      </ItemContent>
      <div className="font-bold">
        {transCurrencyFormat(orderItem.unitPrice * orderItem.quantity)}
      </div>
    </Item>
  );
}
