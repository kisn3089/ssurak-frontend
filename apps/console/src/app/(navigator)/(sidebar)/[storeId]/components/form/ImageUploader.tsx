import { ArrowUp, CircleCheck } from "lucide-react";
import useImageUpload, { FileChange } from "../../hooks/useImageUpload";
import { Button } from "@ssurak/ui/components/buttons/button";
import { cn } from "@ssurak/ui/lib/utils";
import formatBytes from "@utils/formatBytes";
import { Spinner } from "@ssurak/ui/components/spinner";

interface ImageUploaderProps {
  value?: string | null;
  onChange: FileChange;
  onBlur?: () => void;
  disabled?: boolean;
  errorMessage?: string;
}

export default function ImageUploader({
  value,
  onChange,
  onBlur,
  disabled,
  errorMessage,
}: ImageUploaderProps) {
  const {
    uploadedData,
    fileName,
    inputRef,
    isLoading,
    isDragActive,
    onChangePickFile,
    dragHandlers,
  } = useImageUpload({ onChange, disabled });
  const isLoadingOrDisabled = disabled || isLoading;

  if (value) {
    return (
      <div
        className={cn(
          "flex items-center justify-between border rounded-xl p-4 aria-invalid:border-destructive",
          { "pointer-events-none opacity-60": isLoadingOrDisabled }
        )}
        aria-invalid={!!errorMessage}
      >
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-2">
            <CircleCheck size={16} className="text-green-500" />
            <p className="text-sm font-semibold">
              {fileName ?? "업로드된 이미지"}
            </p>
          </div>
          {uploadedData?.variants.hero && (
            <p className="text-xs text-muted-foreground">
              {`업로드 완료 ${uploadedData?.variants.hero.width}x${uploadedData?.variants.hero.height} ${formatBytes(uploadedData?.variants.hero.bytes)}`}
            </p>
          )}
        </div>
        <Button
          type="button"
          onClick={() => inputRef.current?.click()}
          variant={"outline"}
          disabled={isLoadingOrDisabled}
        >
          {isLoadingOrDisabled ? <Spinner /> : "변경"}
        </Button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={isLoadingOrDisabled}
          onClick={(e) => e.stopPropagation()}
          onBlur={onBlur}
          onChange={onChangePickFile}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-y-1 h-32 rounded-xl border border-dashed bg-accent-subtle/80 cursor-pointer transition-colors duration-300 hover:bg-accent",
        "aria-invalid:border-destructive",
        { "bg-accent border-solid border-blue-600": isDragActive },
        { "pointer-events-none opacity-60": isLoadingOrDisabled }
      )}
      aria-invalid={!!errorMessage}
      onClick={() => inputRef.current?.click()}
      {...dragHandlers}
    >
      <Button
        type="button"
        size={"icon"}
        variant={"secondary"}
        className="bg-gray-100 dark:bg-neutral-800"
        aria-label="이미지 파일 선택"
        disabled={isLoadingOrDisabled}
      >
        <ArrowUp className="text-zinc-500 dark:text-gray-300" />
      </Button>
      <p className="text-sm font-semibold">
        {`이미지를 끌어다 놓거나`}
        <span className="text-blue-600">{` 파일 선택`}</span>
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={isLoadingOrDisabled}
        onClick={(e) => e.stopPropagation()}
        onBlur={onBlur}
        onChange={onChangePickFile}
      />
    </div>
  );
}
