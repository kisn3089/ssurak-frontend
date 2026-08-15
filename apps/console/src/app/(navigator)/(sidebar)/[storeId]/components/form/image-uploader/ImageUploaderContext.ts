"use client";

import { createContext, useContext } from "react";

export interface ImageUploaderContextValue {
  isLoadingOrDisabled: boolean;
  errorMessage?: string;
  onBlur?: () => void;
  onChange: (files: File[]) => void;
}

export const ImageUploaderContext =
  createContext<ImageUploaderContextValue | null>(null);

export function useImageUploaderContext() {
  const context = useContext(ImageUploaderContext);
  if (!context) {
    throw new Error(
      "useImageUploaderContext must be used within an ImageUploader"
    );
  }
  return context;
}
