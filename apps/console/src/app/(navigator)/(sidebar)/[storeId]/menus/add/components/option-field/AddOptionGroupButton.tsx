import { Button } from "@ssurak/ui/components/buttons/button";

type AddOptionGroupButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
};

export default function AddOptionGroupButton({
  onClick,
  children,
}: AddOptionGroupButtonProps) {
  return (
    <Button
      type="button"
      variant={"outline"}
      className="h-11 shadow-sm border-dashed rounded-xl w-full mt-2 font-bold"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
