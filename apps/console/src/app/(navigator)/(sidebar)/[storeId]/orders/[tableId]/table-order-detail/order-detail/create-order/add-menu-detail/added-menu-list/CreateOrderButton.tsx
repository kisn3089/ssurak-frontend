import useOrderByTable from "@ssurak/api/core/order/order/useOrderByTable.mutate";
import RequestButton from "@ssurak/ui/components/buttons/RequestButton";
import { useParams } from "next/navigation";
import { useCreateOrderContext } from "../../CreateOrderProvider";
import { toast } from "@ssurak/ui/components/sonner";
import { isAxiosError } from "axios";
import { transCurrencyFormat } from "@ssurak/ui/utils/menu/priceFormatter";

export type CloseDialogProps = {
  closeDialog: () => void;
};

export default function CreateOrderButton({ closeDialog }: CloseDialogProps) {
  const { tableId } = useParams<{ tableId: string }>();
  const { createOrderByTable } = useOrderByTable({ tableId });

  const {
    state: { addedMenus },
    actions: { clearAddedMenus },
    meta: { totalPrice },
  } = useCreateOrderContext();

  const createOrder = async () => {
    try {
      const orderItems = Array.from(addedMenus.values()).map(
        ({ snapshot }) => ({
          menuPublicId: snapshot.menuPublicId,
          quantity: snapshot.quantity,
          options: snapshot.options,
        })
      );

      await createOrderByTable.mutateAsync({
        tableId,
        createOrderPayload: { orderItems },
      });
      closeDialog();
      clearAddedMenus();
    } catch (error: unknown) {
      let message = "주문 생성에 실패했습니다. 다시 시도해 주세요.";
      if (isAxiosError(error) && error.response) {
        message = `${error.response.data.details ? `${error.response.data.details} - ` : ""}${error.response.data.message}`;
      }
      toast.error(message, { position: "top-center" });
    }
  };

  return (
    <div className="p-2 border-t border-border">
      <RequestButton
        mutate={createOrderByTable}
        message={{
          disabled: "메뉴를 추가해 주세요.",
          loading: "주문 생성 중...",
          error: "다시 시도",
        }}
        disabled={addedMenus.size === 0}
        onClick={createOrder}
        className="h-12 font-bold tracking-wide w-full rounded-2xl"
      >
        {`${transCurrencyFormat(totalPrice)} - 주문 생성`}
      </RequestButton>
    </div>
  );
}
