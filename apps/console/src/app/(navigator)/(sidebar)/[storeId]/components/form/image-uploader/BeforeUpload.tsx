import { Button } from "@ssurak/ui/components/buttons/button";
import { cn } from "@ssurak/ui/lib/utils";
import { ArrowUp } from "lucide-react";
import { ComponentProps } from "react";
import useDragFile from "../../../hooks/useDragFile";

type BeforeUploadProps = ComponentProps<"div"> & {
  disabled: boolean | undefined;
  children: React.ReactNode;
  uploadFile: (file: File) => void;
};

export default function BeforeUpload({
  children,
  disabled,
  uploadFile,
  ...props
}: BeforeUploadProps) {
  const { isDragActive, dragHandlers } = useDragFile(disabled, uploadFile);
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-y-1 h-32 rounded-xl border border-dashed bg-background cursor-pointer transition-colors duration-300 hover:bg-accent",
        "aria-invalid:border-destructive",
        { "bg-accent border-solid border-blue-600": isDragActive },
        { "pointer-events-none opacity-60": disabled }
      )}
      {...props}
      {...dragHandlers}
    >
      <Button
        type="button"
        size={"icon"}
        variant={"secondary"}
        className="bg-gray-100 dark:bg-neutral-800"
        aria-label="이미지 파일 선택"
        disabled={disabled}
      >
        <ArrowUp className="text-zinc-500 dark:text-gray-300" />
      </Button>
      <p className="text-sm font-semibold">
        {`이미지를 끌어다 놓거나`}
        <span className="text-blue-600">{` 파일 선택`}</span>
      </p>

      {children}
    </div>
  );
}
