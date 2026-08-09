import { useMenuDetailContext } from "@ssurak/ui/components/menu/menu-detail/MenuDetailContext";
import { transCurrencyFormat } from "@ssurak/ui/utils/menu/priceFormatter";
import { useCreateOrderContext } from "../CreateOrderProvider";
import { Button } from "@ssurak/ui/components/buttons/button";

export default function AddMenuButton() {
  const {
    state: { menu },
    meta: { price, unsatisfiedOptions, selectedSnapshot },
    actions: { snapshotToFetch },
  } = useMenuDetailContext();

  const {
    state: { editingMenu },
    actions: { selectMenuClear, addMenu, updateMenu },
  } = useCreateOrderContext();

  const isEditing = editingMenu !== null;
  // 필수 옵션을 덜 고른 채 주문을 만들면 서버가 400으로 거절한다. 담기 전에 막는다.
  const [missingOption] = unsatisfiedOptions;

  const addMenuToOrder = () => {
    // 표시용 스냅샷을 함께 들고 간다 — 주문 전이라 서버 스냅샷이 없어 이름을 복원할 길이 없다.
    const menuSnapshot = {
      ...snapshotToFetch(),
      optionSnapshot: selectedSnapshot,
    };

    if (editingMenu) {
      updateMenu(menuSnapshot, menu, editingMenu);
    } else {
      addMenu(menuSnapshot, menu);
    }
    selectMenuClear();
  };

  return (
    <div className="p-2 w-full grid grid-cols-[1fr_3fr] gap-x-2 border-t border-border">
      <Button
        onClick={selectMenuClear}
        variant={"secondary"}
        className="h-12 font-bold tracking-wide rounded-2xl"
      >
        닫기
      </Button>
      <Button
        className="h-12 font-bold tracking-wide rounded-2xl"
        onClick={addMenuToOrder}
        disabled={!!missingOption}
      >
        {missingOption
          ? `'${missingOption.name}' 옵션을 선택해 주세요`
          : `${transCurrencyFormat(price)}원 - ${isEditing ? "변경" : "추가"}`}
      </Button>
    </div>
  );
}
