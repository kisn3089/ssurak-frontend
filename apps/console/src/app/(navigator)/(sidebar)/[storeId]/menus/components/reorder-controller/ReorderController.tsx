import { Button } from "@ssurak/ui/components/buttons/button";
import { ReorderChildrenProps } from "../../../components/form/reorder-form-field/ReorderForm";
import ReorderRow from "../../../components/form/reorder-form-field/ReorderRow";
import { CategoryReorderRow } from "./category-reorder-control.type";
import { PencilIcon, XIcon } from "lucide-react";
import { cn } from "@ssurak/ui/lib/utils";

type ReorderControllerProps = ReorderChildrenProps<CategoryReorderRow> & {
  setIsRenderChild: (index: number | undefined) => void;
  deleteRow: (id: string, name: string) => void;
};
export default function ReorderController({
  row,
  index,
  getHandleProps,
  deleteRow,
  setIsRenderChild,
}: ReorderControllerProps) {
  const isDisabled = row.menus.length > 0;
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
          onClick={() => setIsRenderChild(index)}
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
