export type FileRule = (file: File) => string | null;
export type FileListRule = (files: File[]) => string | null;
export type RejectedFile = { file: File; message: string };

function firstFailedMessage(file: File, rules: FileRule[]) {
  for (const rule of rules) {
    const message = rule(file);
    if (message) return message;
  }
  return null;
}

const imageType = (): FileRule => (file) =>
  file.type.startsWith("image/") ? null : "이미지 파일만 업로드할 수 있습니다.";

const maxUploadSize =
  (maxSizeBytes: number, maxSizeMB: number): FileRule =>
  (file) =>
    file.size <= maxSizeBytes
      ? null
      : `파일 크기는 ${maxSizeMB}MB를 초과할 수 없습니다.`;

const maxUploadCount =
  (maxCount: number): FileListRule =>
  (files) =>
    files.length <= maxCount
      ? null
      : `최대 ${maxCount}개까지 업로드할 수 있습니다.`;

const duplicateFile = (): FileListRule => (files) => {
  const fileNames = new Set<string>();
  for (const file of files) {
    if (fileNames.has(file.name)) return "중복된 파일은 업로드할 수 없습니다.";
    fileNames.add(file.name);
  }
  return null;
};

type ValidateOptions = { fileRules?: FileRule[]; listRules?: FileListRule[] };

function validate({ fileRules = [], listRules = [] }: ValidateOptions) {
  return (files: File[]) => {
    for (const rule of listRules) {
      const message = rule(files);
      if (message) return message;
    }

    for (const file of files) {
      const message = firstFailedMessage(file, fileRules);
      if (message) return message;
    }

    return null;
  };
}

function partition(fileRules: FileRule[]) {
  return (files: File[]) => {
    const accepted: File[] = [];
    const rejected: RejectedFile[] = [];

    for (const file of files) {
      const message = firstFailedMessage(file, fileRules);
      if (message) {
        rejected.push({ file, message });
      } else {
        accepted.push(file);
      }
    }

    return { accepted, rejected };
  };
}

export const fileValidators = {
  validate,
  partition,
  imageType,
  maxUploadSize,
  maxUploadCount,
  duplicateFile,
};
