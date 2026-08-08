import { Dialog, DialogContent } from "@ssurak/ui/components/layouts/dialog";
import SuccessDialogHeader from "./SuccessDialogHeader";
import CreatedMenuThumbnail, { CreatedMenu } from "./CreatedMenuThumbnail";
import SuccessDialogFooter from "./SuccessDialogFooter";
import ReorderFailedNotice from "./ReorderFailedNotice";
import OptionSaveFailedNotice from "./OptionSaveFailedNotice";
import { usePathname } from "next/navigation";
import { MenuSubmitOutcome } from "../../../tables/types/menu-form.type";

type SuccessMenuDialogProps = {
  menu: CreatedMenu;
  outcome: MenuSubmitOutcome | null;
  reset: () => void;
  children: React.ReactNode;
};
export default function SuccessMenuDialog({
  menu,
  children,
  outcome,
  reset,
}: SuccessMenuDialogProps) {
  const pathname = usePathname();
  const mode: "add" | "edit" =
    pathname.split("/").pop() === "add" ? "add" : "edit";
  const actionText = mode === "add" ? "등록" : "수정";

  return (
    <Dialog open={outcome !== null} onOpenChange={(open) => !open && reset()}>
      {children}
      <DialogContent className="w-fit flex flex-col gap-y-6">
        <SuccessDialogHeader actionText={actionText}>
          {`${menu.name}이(가) ${actionText}되었습니다.`}
        </SuccessDialogHeader>
        <CreatedMenuThumbnail menu={menu} />
        {outcome?.reorderFailed && (
          <ReorderFailedNotice actionText={actionText} />
        )}
        {outcome?.optionsFailed && <OptionSaveFailedNotice />}
        <SuccessDialogFooter>{`계속 ${actionText}`}</SuccessDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
