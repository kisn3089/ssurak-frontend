import { Tag, X } from "lucide-react";
import OptionTags from "@ssurak/ui/components/menu/options/OptionTags";
import {
  AddedMenuEntry,
  useCreateOrderContext,
} from "../../CreateOrderProvider";
import { transCurrencyFormat } from "@ssurak/ui/utils/menu/priceFormatter";
import { Button } from "@ssurak/ui/components/buttons/button";

type AddedMenuProps = {
  entry: AddedMenuEntry;
};

export default function AddedMenu({ entry }: AddedMenuProps) {
  const { snapshot, menu: menuDef } = entry;

  const {
    actions: { deleteMenu, editMenu },
  } = useCreateOrderContext();

  const hasOptions = snapshot.optionSnapshot.length > 0;

  const deleteAddedMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    deleteMenu(snapshot);
  };

  // 고른 옵션은 스냅샷에 그대로 있으므로 메뉴 정의를 손댈 필요 없이 그대로 넘긴다.
  const editAddedMenu = () => editMenu(menuDef, snapshot);

  return (
    <Button
      asChild
      variant={"outline"}
      className="w-full h-full hover:bg-background block"
    >
      <div
        onClick={editAddedMenu}
        className={`px-5 py-4 bg-background rounded-xl shadow-md`}
      >
        <div className="flex items-center justify-between">
          <p className="font-semibold">{snapshot.menuName}</p>
          <div className="flex gap-x-2 items-center">
            <p className="tabular-nums">{snapshot.quantity}개</p>
            <Button
              size={"icon-sm"}
              variant={"secondary"}
              className="border border-border"
              onClick={deleteAddedMenu}
            >
              <X width={14} />
            </Button>
          </div>
        </div>
        <div className="flex justify-between pt-1">
          {hasOptions ? (
            <div className="flex flex-nowrap items-center gap-1">
              <Tag width={14} />
              <OptionTags
                options={snapshot.optionSnapshot}
                variant="secondary"
              />
            </div>
          ) : (
            <div />
          )}
          <span className="tracking-wide font-semibold">
            {transCurrencyFormat(snapshot.price)}
          </span>
        </div>
      </div>
    </Button>
  );
}
