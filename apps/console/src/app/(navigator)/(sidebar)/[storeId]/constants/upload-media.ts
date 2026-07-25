/** 업로드 이미지 프리셋. 썸네일은 640px, 본문 삽입 이미지는 1920px로 리사이즈된다. */
export const IMAGE_PRESETS = ["thumbnail", "content"] as const;
export type ImagePreset = (typeof IMAGE_PRESETS)[number];

/** 업로드 허용 용량 (backend media.constants.ts). */
export const MAX_UPLOAD_SIZE_MB = 5;
export const MAX_UPLOAD_SIZE = MAX_UPLOAD_SIZE_MB * 1024 * 1024;
