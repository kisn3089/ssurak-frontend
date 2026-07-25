import { Dialog, DialogContent } from "@ssurak/ui/components/layouts/dialog";
import SuccessDialogHeader from "./SuccessDialogHeader";
import CreatedMenuThumbnail, { CreatedMenu } from "./CreatedMenuThumbnail";
import SuccessDialogFooter from "./SuccessDialogFooter";
import { usePathname } from "next/navigation";

type SuccessMenuDialogProps = {
  menu: CreatedMenu;
  isSuccess: boolean;
  reset: () => void;
  children: React.ReactNode;
};
export default function SuccessMenuDialog({
  menu,
  children,
  isSuccess,
  reset,
}: SuccessMenuDialogProps) {
  const pathname = usePathname();
  const mode: "add" | "edit" =
    pathname.split("/").pop() === "add" ? "add" : "edit";
  const actionText = mode === "add" ? "등록" : "수정";

  return (
    <Dialog open={isSuccess} onOpenChange={(open) => !open && reset()}>
      {children}
      <DialogContent className="w-fit flex flex-col gap-y-6">
        <SuccessDialogHeader actionText={actionText}>
          {`${menu.name}이(가) ${actionText}되었습니다.`}
        </SuccessDialogHeader>
        <CreatedMenuThumbnail menu={menu} />
        <SuccessDialogFooter>{`계속 ${actionText}`}</SuccessDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
