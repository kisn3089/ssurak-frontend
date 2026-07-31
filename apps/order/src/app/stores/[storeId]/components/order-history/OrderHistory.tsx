"use client";

import useSuspenseWithSession from "@ssurak/api/hooks/useSuspenseWithSession";
import { OrderWithItemsResponse } from "@ssurak/api/types/order/order.interface";
import { Badge } from "@ssurak/ui/components/forms/badge";
import { BADGE_BY_ORDER_STATUS } from "@ssurak/ui/constants/badgeByOrderStatus.const";
import { formatDate } from "../../(navigator)/utils/date-format";
import OrderedItem from "./OrderedItem";
import { transCurrencyFormat } from "@ssurak/ui/utils/menu/priceFormatter";
import { sumFromObjects } from "@ssurak/api/utils/price";

export default function OrderHistory() {
  const { data: orders } = useSuspenseWithSession<OrderWithItemsResponse[]>(
    "/orders/v1/sessions/orders",
    {
      queryOptions: { refetchOnMount: "always" },
    }
  );

  if (orders.length === 0) {
    return <div className="font-bold text-center">주문 내역이 없습니다!</div>;
  }

  return (
    <div className="flex flex-col gap-4 overflow-x-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-2">
      {orders
        .filter((order) => order.orderItems.length > 0)
        .map((order) => (
          <div
            key={order.publicId}
            className="flex rounded-4xl border border-border p-4 shadow-md w-full"
          >
            <div className="flex flex-col gap-y-2 w-full">
              <div id="header" className="flex justify-between">
                <Badge
                  className="font-semibold text-center text-xs w-fit"
                  variant={BADGE_BY_ORDER_STATUS[order.status].badgeVariant}
                >
                  {BADGE_BY_ORDER_STATUS[order.status].label}
                </Badge>
                <p className="text-xs text-muted-foreground font-semibold tracking-tight">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex flex-col gap-y-2 w-full">
                {order.orderItems.map((orderItem) => (
                  <OrderedItem key={orderItem.publicId} orderItem={orderItem} />
                ))}
              </div>
              <div className="flex justify-between items-center py-3 px-4 rounded-2xl border border-border">
                <span className="font-bold text-sm">주문 합계</span>
                <div className="font-bold">
                  {transCurrencyFormat(
                    sumFromObjects(
                      order.orderItems,
                      (item) => item.unitPrice * item.quantity
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
