"use client";

import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import ErrorMessage from "./ErrorMessage";
import { Field } from "@ssurak/ui/components/forms/field";
import FormLabel from "./FormLabel";
import ImageUploader from "./image-uploader/ImageUploader";
import UploadedImage from "./image-uploader/UploadedImage";
import { useUploadMediaMutation } from "@ssurak/api/core/upload/useUploadMutation";
import { toast } from "@ssurak/ui/components/sonner";
import {
  MAX_UPLOAD_SIZE,
  MAX_UPLOAD_SIZE_MB,
} from "../../constants/upload-media";
import { useState } from "react";
import { fileValidators } from "./utils/fileValidators";

export type FileChange = (imageKey: string | null) => void;
export type StaticUploadField<Payload extends FieldValues> = {
  id: FieldPath<Payload>;
  label: string;
  required?: boolean;
  type: "file";
  description?: React.ReactNode;
};

export type DynamicUploadField<Payload extends FieldValues> =
  StaticUploadField<Payload> & {
    control: Control<Payload>;
    errorMessage?: string;
  };

export default function UploadFormField<Payload extends FieldValues>({
  id,
  control,
  label,
  errorMessage,
  required,
}: DynamicUploadField<Payload>) {
  const [fileName, setFileName] = useState<string | null>(null);
  const upload = useUploadMediaMutation();

  const uploadFile = (file: File, onChange: FileChange) => {
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

  const onChangePickFile = (files: File[], onChange: FileChange) => {
    if (files.length === 0) return;

    const { validate, imageType, maxUploadSize } = fileValidators;
    const invalidMessage = validate({
      fileRules: [
        imageType(),
        maxUploadSize(MAX_UPLOAD_SIZE, MAX_UPLOAD_SIZE_MB),
      ],
    })(files);

    if (invalidMessage) {
      toast.error(invalidMessage);
      return;
    }

    uploadFile(files[0], onChange);
  };

  return (
    <div className="flex flex-col gap-2">
      <Field>
        <FormLabel id={id} required={required} label={label} />
        <Controller
          control={control}
          name={id}
          render={({ field }) => (
            <ImageUploader
              value={field.value}
              onBlur={field.onBlur}
              errorMessage={errorMessage}
              onChange={(files) => onChangePickFile(files, field.onChange)}
              isLoading={upload.isPending}
            >
              <UploadedImage
                fileName={fileName}
                uploadedData={upload.data}
                setFileName={setFileName}
                onChange={field.onChange}
              />
            </ImageUploader>
          )}
        />
      </Field>
      <ErrorMessage errorMessage={errorMessage} />
    </div>
  );
}
