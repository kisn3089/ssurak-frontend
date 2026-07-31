import { Button } from "@ssurak/ui/components/buttons/button";

export default function OptionAddButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant={"outline"}
      className="border border-dashed text-muted-foreground bg-zinc-50 shadow-sm"
      onClick={onClick}
    >
      + 옵션 값 추가
    </Button>
  );
}
