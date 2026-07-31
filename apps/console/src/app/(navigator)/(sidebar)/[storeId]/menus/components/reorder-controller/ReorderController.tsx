import { Button } from "@ssurak/ui/components/buttons/button";
import { ReorderChildrenProps } from "../../../components/form/reorder-form-field/ReorderForm";
import ReorderRow from "../../../components/form/reorder-form-field/ReorderRow";
import { CategoryReorderRow } from "./category-reorder-control.type";
import { PencilIcon, XIcon } from "lucide-react";
import { cn } from "@ssurak/ui/lib/utils";
import { isPendingCategoryId } from "@ssurak/api/core/store/category/pendingCategory";

type ReorderControllerProps = ReorderChildrenProps<CategoryReorderRow> & {
  onStartRename: () => void;
  deleteRow: (id: string, name: string) => void;
};
export default function ReorderController({
  row,
  index,
  getHandleProps,
  deleteRow,
  onStartRename,
}: ReorderControllerProps) {
  // 아직 서버가 id를 발급하지 않은 행이라 이름 변경·삭제 요청을 보낼 수 없다.
  const isPending = isPendingCategoryId(row.id);
  const isDisabled = isPending || row.menus.length > 0;
  return (
    <ReorderRow reorderName={row.name} dragHandleProps={getHandleProps(index)}>
      <div className="flex items-center gap-x-2">
        <span className="text-xs text-muted-foreground">
          메뉴 {row.menus.length}
        </span>
        <Button
          type="button"
          variant={"outline"}
          size={"icon-sm"}
          className="shadow-none text-muted-foreground h-8"
          onClick={onStartRename}
          disabled={isPending}
        >
          <PencilIcon />
        </Button>
        <Button
          type="button"
          variant={"outline"}
          size={"icon-sm"}
          className="shadow-none text-muted-foreground h-8"
          onClick={() => deleteRow(row.id, row.name)}
          disabled={isDisabled}
        >
          <XIcon
            className={cn({ "text-red-500 dark:text-red-400": !isDisabled })}
          />
        </Button>
      </div>
    </ReorderRow>
  );
}
