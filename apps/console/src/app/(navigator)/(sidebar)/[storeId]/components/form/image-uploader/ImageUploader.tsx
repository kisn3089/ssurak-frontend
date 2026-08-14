"use client";

import { ComponentProps } from "react";
import BeforeUpload from "./BeforeUpload";
import { ImageUploaderContext } from "./ImageUploaderContext";

type ImageUploaderProps = {
  value?: string | null;
  onChange: (files: File[]) => void;
  onBlur?: () => void;
  disabled?: boolean;
  isLoading: boolean;
  errorMessage?: string;
  children?: React.ReactNode;
  description?: string;
  inputProps?: ComponentProps<"input">;
};

export default function ImageUploader({
  value,
  onChange,
  onBlur,
  disabled,
  isLoading,
  errorMessage,
  children,
  description,
  inputProps,
}: ImageUploaderProps) {
  return (
    <ImageUploaderContext.Provider
      value={{
        isLoadingOrDisabled: disabled || isLoading,
        errorMessage,
        onBlur,
        onChange,
      }}
    >
      {value ? (
        children
      ) : (
        <BeforeUpload description={description} {...inputProps} />
      )}
    </ImageUploaderContext.Provider>
  );
}
