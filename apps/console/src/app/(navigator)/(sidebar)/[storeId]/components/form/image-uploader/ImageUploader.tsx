import { CircleCheck } from "lucide-react";
import useImageUpload, { FileChange } from "../../../hooks/useImageUpload";
import { Button } from "@ssurak/ui/components/buttons/button";
import { cn } from "@ssurak/ui/lib/utils";
import { Spinner } from "@ssurak/ui/components/spinner";
import BeforeUpload from "./BeforeUpload";
import UploadInfo from "./UploadInfo";

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
    uploadFile,
    onChangePickFile,
    setFileName,
  } = useImageUpload(onChange);

  const isLoadingOrDisabled = disabled || isLoading;

  const UploadInput = (
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
  );

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
          <UploadInfo uploadedImage={uploadedData?.variants.hero} />
        </div>
        <div>
          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            variant={"outline"}
            disabled={isLoadingOrDisabled}
            className="mr-2"
          >
            {isLoadingOrDisabled ? <Spinner /> : "변경"}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onChange(null);
              setFileName(null);
            }}
            variant={"outline"}
            disabled={isLoadingOrDisabled}
          >
            {"삭제"}
          </Button>
        </div>
        {UploadInput}
      </div>
    );
  }

  return (
    <BeforeUpload
      disabled={isLoadingOrDisabled}
      uploadFile={uploadFile}
      aria-invalid={!!errorMessage}
      onClick={() => inputRef.current?.click()}
    >
      {UploadInput}
    </BeforeUpload>
  );
}
