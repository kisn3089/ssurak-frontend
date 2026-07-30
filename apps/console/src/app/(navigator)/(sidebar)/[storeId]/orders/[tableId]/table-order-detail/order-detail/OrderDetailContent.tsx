"use client";

import EmptyOrderDetail from "../EmptyOrderDetail";
import { useOrderDetailContext } from "./OrderDetailContext";

interface OrderDetailContentProps {
  children: React.ReactNode;
}

/**
 * 주문이 있는 경우에만 children을 렌더링
 * 주문이 없으면 EmptyOrderDetail을 표시
 */
export function OrderDetailContent({ children }: OrderDetailContentProps) {
  const {
    state: { orderItems },
  } = useOrderDetailContext();

  if (orderItems.length === 0) {
    return <EmptyOrderDetail />;
  }

  return children;
}
