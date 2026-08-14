"use client";

import ImageUploader from "../../../components/form/image-uploader/ImageUploader";
import {
  fileValidators,
  RejectedFile,
} from "../../../components/form/utils/fileValidators";
import { useState } from "react";
import UploadedMultipleImages from "./UploadedMultipleImages";
import ValidatedImages from "./ValidatedImages";
import {
  MAX_OCR_UPLOAD_COUNT,
  MAX_OCR_UPLOAD_SIZE,
  MAX_OCR_UPLOAD_SIZE_MB,
} from "../../../constants/upload-media";
import { toast } from "@ssurak/ui/components/sonner";
import MultiUploadedLayout from "./MultiUploadedLayout";
import FailedImageList from "./FailedImageList";
import ControllerFooter from "./ControllerFooter";
import useMenuDraftMutation from "@ssurak/api/core/store/menu/draft/useMenuDraftMutation";
import { httpMenuDraftErrors } from "@ssurak/api/core/store/menu/draft/httpMenuDraftErrors";
import { useParams, useRouter } from "next/navigation";
import useExtractionStep from "../hooks/useExtractionStep";
import ResetUploader from "./ResetUploader";
import { revalidateMenuDrafts } from "@/app/common/servers/revalidateMenuDrafts";

export default function MultipleImageUploader() {
  const { storeId } = useParams<{ storeId: string }>();
  const router = useRouter();
  const { createDraft } = useMenuDraftMutation(storeId);
  const extractionStep = useExtractionStep(
    createDraft.isPending,
    createDraft.submittedAt
  );

  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);
  const [rejectedFiles, setRejectedFiles] = useState<RejectedFile[]>([]);

  const {
    validate,
    partition,
    imageType,
    maxUploadSize,
    maxUploadCount,
    duplicateFile,
  } = fileValidators;

  const onChangePickFile = (files: File[]) => {
    if (files.length === 0) return;

    const acceptedAndFiles = [...acceptedFiles, ...files];
    const invalidMessage = validate({
      listRules: [maxUploadCount(MAX_OCR_UPLOAD_COUNT), duplicateFile()],
    })(acceptedAndFiles);

    if (invalidMessage) {
      toast.error(invalidMessage);
      return;
    }

    const { accepted, rejected } = partition([
      imageType(),
      maxUploadSize(MAX_OCR_UPLOAD_SIZE, MAX_OCR_UPLOAD_SIZE_MB),
    ])(files);

    // 재시도한 파일은 기존 실패 항목을 대체한다.
    const retriedNames = new Set(files.map((file) => file.name));
    const keptRejected = rejectedFiles.filter(
      ({ file }) => !retriedNames.has(file.name)
    );

    setAcceptedFiles([...acceptedFiles, ...accepted]);
    setRejectedFiles([...keptRejected, ...rejected]);
  };

  const removeRejectedFile = (file: File) =>
    setRejectedFiles((prev) => prev.filter((f) => f.file !== file));

  const removeAcceptedFile = (file: File) =>
    setAcceptedFiles((prev) => prev.filter((f) => f !== file));

  const clearFiles = () => {
    setAcceptedFiles([]);
    setRejectedFiles([]);
  };

  const uploadFiles = () => {
    if (acceptedFiles.length === 0) {
      toast.error("업로드할 파일이 없습니다.");
      return;
    }

    createDraft.mutate(
      { files: acceptedFiles },
      {
        onSuccess: ({ draftId }) => {
          revalidateMenuDrafts(storeId);
          router.push(`/${storeId}/menus/import/${draftId}`);
        },
        onError: (error) => {
          toast.error(httpMenuDraftErrors.post(error));
        },
      }
    );
  };

  const resetUploaderDisabled =
    createDraft.isPending ||
    (acceptedFiles.length === 0 && rejectedFiles.length === 0);

  return (
    <>
      <ImageUploader
        value={acceptedFiles[0]?.name || null}
        description={`최대 3장까지 업로드할 수 있습니다.\n글자가 정면으로 보이고 그늘, 반사가 적을수록 정확합니다.`}
        onChange={onChangePickFile}
        inputProps={{ multiple: true }}
        isLoading={createDraft.isPending}
      >
        <UploadedMultipleImages>
          <ValidatedImages
            acceptedFiles={acceptedFiles}
            removeAcceptedFile={removeAcceptedFile}
            step={extractionStep}
          >
            {rejectedFiles.length > 0 && (
              <MultiUploadedLayout
                invalid={true}
                fileLength={rejectedFiles.length}
              >
                <FailedImageList
                  rejectedFiles={rejectedFiles}
                  removeRejectedFile={removeRejectedFile}
                />
              </MultiUploadedLayout>
            )}
          </ValidatedImages>
        </UploadedMultipleImages>
      </ImageUploader>
      <ControllerFooter
        uploadFiles={uploadFiles}
        acceptedFileCount={acceptedFiles.length}
        isExtracting={createDraft.isPending}
      >
        <ResetUploader
          clearFiles={clearFiles}
          disabled={resetUploaderDisabled}
        />
      </ControllerFooter>
    </>
  );
}
