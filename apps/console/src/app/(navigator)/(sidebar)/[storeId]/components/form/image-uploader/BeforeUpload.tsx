import { buttonVariants } from "@ssurak/ui/components/buttons/button";
import { cn } from "@ssurak/ui/lib/utils";
import { ArrowUp } from "lucide-react";
import useDragFile from "../../../hooks/useDragFile";
import { useImageUploaderContext } from "./ImageUploaderContext";
import UploadTrigger from "./UploadTrigger";
import { ComponentProps } from "react";

type BeforeUploadProps = {
  description?: string;
} & ComponentProps<"input">;
export default function BeforeUpload({
  description,
  ...props
}: BeforeUploadProps) {
  const { isLoadingOrDisabled, onChange, errorMessage } =
    useImageUploaderContext();
  const { isDragActive, dragHandlers } = useDragFile(
    isLoadingOrDisabled,
    onChange
  );

  return (
    <UploadTrigger
      className={cn(
        "flex flex-col items-center justify-center gap-y-1 h-32 rounded-xl border border-dashed bg-background transition-colors duration-300 hover:bg-accent",
        "aria-invalid:border-destructive",
        { "bg-accent border-solid border-blue-600": isDragActive },
        { "pointer-events-none opacity-60": isLoadingOrDisabled }
      )}
      aria-invalid={!!errorMessage}
      inputProps={props}
      {...dragHandlers}
    >
      <span
        aria-hidden
        className={cn(
          buttonVariants({ variant: "secondary", size: "icon" }),
          "bg-gray-100 dark:bg-neutral-800"
        )}
      >
        <ArrowUp className="text-zinc-500 dark:text-gray-300" />
      </span>
      <p className="text-sm font-semibold">
        {`이미지를 끌어다 놓거나`}
        <span className="text-blue-600">{` 파일 선택`}</span>
      </p>
      {description && (
        <p className="text-xs text-muted-foreground whitespace-pre text-center">
          {description}
        </p>
      )}
    </UploadTrigger>
  );
}
