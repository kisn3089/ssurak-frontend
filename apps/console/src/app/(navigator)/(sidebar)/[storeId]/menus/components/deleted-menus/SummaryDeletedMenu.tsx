import { Button } from "@ssurak/ui/components/buttons/button";
import { ChevronDown } from "lucide-react";

type SummaryDeletedMenuProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deletedMenuCount: number;
};
export default function SummaryDeletedMenu({
  isOpen,
  setIsOpen,
  deletedMenuCount,
}: SummaryDeletedMenuProps) {
  return (
    <tr>
      <th className="w-48 min-w-48 p-1.5 pl-4 text-left">
        {`영구 삭제될 메뉴 ${deletedMenuCount}개`}
      </th>
      <th colSpan={3} className="p-1.5 pr-4 text-right">
        <Button
          type="button"
          variant={"secondary"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </Button>
      </th>
    </tr>
  );
}
