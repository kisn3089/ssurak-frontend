"use client";

import { useCart } from "./CartProvider";
import RequestButton from "@ssurak/ui/components/buttons/RequestButton";

export default function CartPayment() {
  const {
    meta,
    state: { menus, createOrderMutate },
    actions,
  } = useCart();

  return (
    <section className="p-4">
      <h3 className="font-bold text-lg">결제 상세</h3>
      <div className="p-3 flex flex-col font-semibold divide-y-2 divide-black">
        <div className="flex justify-between py-2">
          <p>주문 금액</p>
          <p>{meta.totalPrice.toLocaleString()}원</p>
        </div>
        <div className="flex justify-between text-lg py-2">
          <p>총 결제 금액</p>
          <p className="text-orange-700">
            {meta.totalPrice.toLocaleString()}원
          </p>
        </div>
      </div>
      <RequestButton
        mutate={createOrderMutate}
        message={{
          disabled: "주문할 상품이 없습니다.",
          error: "주문 생성 실패. 다시 시도해주세요.",
          loading: "주문 생성 중...",
        }}
        onClick={actions.createOrderRequest}
        className="w-full h-12 font-bold rounded-3xl"
        disabled={menus.length === 0}
      >
        주문 하기
      </RequestButton>
    </section>
  );
}
