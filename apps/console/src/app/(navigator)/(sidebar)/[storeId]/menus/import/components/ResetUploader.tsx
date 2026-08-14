import { Button } from "@ssurak/ui/components/buttons/button";

type ResetUploaderProps = {
  clearFiles: () => void;
  disabled: boolean;
};

export default function ResetUploader({
  clearFiles,
  disabled,
}: ResetUploaderProps) {
  return (
    <Button
      className="h-full col-span-1 rounded-3xl md:mr-auto"
      variant={"secondary"}
      onClick={clearFiles}
      disabled={disabled}
    >
      처음부터
    </Button>
  );
}
