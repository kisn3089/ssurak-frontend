import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ssurak/ui/components/layouts/dialog";
import SuccessCheck from "@ssurak/ui/components/SuccessCheck";

type SuccessDialogHeaderProps = {
  actionText: string;
  children: React.ReactNode;
};
export default function SuccessDialogHeader({
  actionText,
  children,
}: SuccessDialogHeaderProps) {
  return (
    <DialogHeader>
      <div className="mx-auto mb-6">
        <SuccessCheck />
      </div>
      <DialogTitle className="text-center font-bold animate-tzRiseFast">
        {`메뉴가 ${actionText}되었어요`}
      </DialogTitle>
      <DialogDescription
        style={{ animationDelay: "0.16s" }}
        className="text-center animate-tzRiseFast"
      >
        {children}
      </DialogDescription>
    </DialogHeader>
  );
}
