import { TableCell } from "@ssurak/ui/components/table";
import OptionTags from "@ssurak/ui/components/menu/options/OptionTags";
import { OrderItemWithOrder } from "../OrderDetailTable";

interface OrderTableOptionsProps {
  optionsSnapshot: OrderItemWithOrder["optionsSnapshot"];
}

/** 주문 시점에 확정된 옵션. 이름·금액이 스냅샷에 들어 있어 메뉴를 다시 조회하지 않는다. */
export function OrderTableOptions({ optionsSnapshot }: OrderTableOptionsProps) {
  if (!optionsSnapshot?.options.length) return null;

  return (
    <TableCell className="flex gap-1 flex-wrap pt-4 px-4 pb-0">
      <OptionTags options={optionsSnapshot.options} variant="secondary" />
    </TableCell>
  );
}
