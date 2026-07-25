import { useUploadMediaMutation } from "@ssurak/api/core/upload/useUploadMutation";
import { useRef, useState } from "react";
import { MAX_UPLOAD_SIZE, MAX_UPLOAD_SIZE_MB } from "../constants/upload-media";
import { toast } from "@ssurak/ui/components/sonner";

export type FileChange = (imageKey: string) => void;
interface UseImageUploadProps {
  onChange: FileChange;
  disabled?: boolean;
}
export default function useImageUpload({
  onChange,
  disabled,
}: UseImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const dragDepthRef = useRef(0);
  const upload = useUploadMediaMutation();

  const isLoading = upload.isPending;
  const isBlocked = disabled || isLoading;

  const uploadFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      toast.error(
        `이미지는 ${MAX_UPLOAD_SIZE_MB}MB 이하만 업로드할 수 있습니다.`
      );
      return;
    }

    upload.mutate(
      { file },
      {
        onSuccess: (media) => {
          setFileName(file.name);
          onChange(media.imageKey);
        },
        onError: (error) => {
          if (error.response?.data?.message) {
            toast.error(error.response.data.message);
          } else {
            toast.error("썸네일 업로드에 실패했습니다.");
          }
        },
      }
    );
  };

  const onChangePickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    uploadFile(file);
  };

  const resetDrag = () => {
    dragDepthRef.current = 0;
    setIsDragActive(false);
  };

  const dragHandlers = {
    onDragEnter: (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      if (isBlocked) return;
      dragDepthRef.current += 1;
      setIsDragActive(true);
    },
    onDragOver: (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      if (isBlocked) return;
      e.dataTransfer.dropEffect = "copy";
    },
    onDragLeave: (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      dragDepthRef.current -= 1;
      if (dragDepthRef.current <= 0) resetDrag();
    },
    onDrop: (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      resetDrag();
      if (isBlocked) return;

      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      uploadFile(file);
    },
  };

  return {
    uploadedData: upload.data,
    fileName,
    inputRef,
    isLoading,
    isDragActive,
    onChangePickFile,
    dragHandlers,
  };
}
