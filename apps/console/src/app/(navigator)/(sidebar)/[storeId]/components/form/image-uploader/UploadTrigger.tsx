import { cn } from "@ssurak/ui/lib/utils";
import { ComponentProps } from "react";
import { useImageUploaderContext } from "./ImageUploaderContext";

export default function UploadTrigger({
  className,
  children,
  inputProps,
  ...props
}: ComponentProps<"label"> & { inputProps?: ComponentProps<"input"> }) {
  const { isLoadingOrDisabled, onChange, onBlur, errorMessage } =
    useImageUploaderContext();

  return (
    <label
      className={cn(
        "cursor-pointer has-focus-visible:border-ring has-focus-visible:ring-ring/50 has-focus-visible:ring-[3px]",
        className
      )}
      {...props}
    >
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={isLoadingOrDisabled}
        aria-invalid={!!errorMessage}
        onBlur={onBlur}
        onChange={(e) => {
          onChange(Array.from(e.target.files || []));
          e.target.value = "";
        }}
        {...inputProps}
      />
      {children}
    </label>
  );
}
