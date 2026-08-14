import { useRef, useState } from "react";

export default function useDragFile(
  isBlocked: boolean | undefined,
  onChange: (files: File[]) => void
) {
  const [isDragActive, setIsDragActive] = useState(false);
  const dragDepthRef = useRef(0);

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

      const file = Array.from(e.dataTransfer.files);
      onChange(file);
    },
  };

  return { isDragActive, dragHandlers };
}
