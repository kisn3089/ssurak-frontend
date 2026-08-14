import MultiUploadedLayout from "./MultiUploadedLayout";
import MenuImage from "../../add/components/MenuImage";
import { XIcon } from "lucide-react";
import StepLoading from "./StepLoading";
import { cn } from "@ssurak/ui/lib/utils";

type ValidateImagesProps = {
  acceptedFiles: File[];
  removeAcceptedFile: (file: File) => void;
  step: number | null;
  children: React.ReactNode;
};

export default function ValidatedImages({
  acceptedFiles,
  removeAcceptedFile,
  step,
  children,
}: ValidateImagesProps) {
  const isLoading = step !== null && step < 3;

  return (
    <>
      {children}
      <MultiUploadedLayout invalid={false} fileLength={acceptedFiles.length}>
        <StepLoading step={step} />
        <div
          className={cn(
            "grid grid-cols-3 gap-2 w-full relative overflow-hidden rounded-2xl",
            {
              "[&_img]:grayscale animate-pulse pointer-events-none": isLoading,
            }
          )}
        >
          {acceptedFiles.map((file, index) => (
            <div key={`${file.name}-${index}`} className="w-full relative">
              <MenuImage
                src={URL.createObjectURL(file)}
                alt={file.name}
                size="thumbnail"
                className="size-48 w-full rounded-2xl shadow-lg"
              />
              <button
                type="button"
                onClick={() => removeAcceptedFile(file)}
                className="absolute top-1 right-1 rounded-full backdrop-blur-lg p-1 shadow-lg cursor-pointer border border-transparent bg-primary/30 transition-transform outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] liquid-glass pressable:scale-95"
              >
                <XIcon className="size-4 text-background" />
              </button>
            </div>
          ))}
        </div>
      </MultiUploadedLayout>
    </>
  );
}
