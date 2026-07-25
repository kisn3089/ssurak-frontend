import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  UploadedMedia,
  uploadMedia,
  UploadMediaPayload,
} from "@ssurak/api/core/upload/httpUpload";
import { Exception } from "../../types/exception.interface";

export function useUploadMediaMutation() {
  return useMutation<UploadedMedia, AxiosError<Exception>, UploadMediaPayload>({
    mutationFn: ({ file }) => uploadMedia(file),
  });
}
