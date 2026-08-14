import { cn } from "@ssurak/ui/lib/utils";
import { CircleCheck } from "lucide-react";
import UploadInfo from "./UploadInfo";
import { Button, buttonVariants } from "@ssurak/ui/components/buttons/button";
import { Spinner } from "@ssurak/ui/components/spinner";
import { useImageUploaderContext } from "./ImageUploaderContext";
import UploadTrigger from "./UploadTrigger";
import { Dispatch, SetStateAction } from "react";
import { UploadedMedia } from "@ssurak/api/core/upload/httpUpload";
import { FileChange } from "../UploadFormField";

type UploadedImageProps = {
  fileName?: string | null;
  uploadedData?: UploadedMedia;
  setFileName: Dispatch<SetStateAction<string | null>>;
  onChange: FileChange;
};
export default function UploadedImage({
  fileName,
  uploadedData,
  setFileName,
  onChange,
}: UploadedImageProps) {
  const { isLoadingOrDisabled, errorMessage } = useImageUploaderContext();

  return (
    <div
      className={cn(
        "flex items-center justify-between border rounded-xl p-4 aria-invalid:border-destructive bg-background",
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
      <div className="flex items-center gap-2">
        <UploadTrigger className={buttonVariants({ variant: "outline" })}>
          {isLoadingOrDisabled ? <Spinner /> : "변경"}
        </UploadTrigger>
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
    </div>
  );
}
