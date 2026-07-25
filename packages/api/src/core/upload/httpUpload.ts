import { http } from "../axios/http";

interface VariantInfo {
  width: number;
  height: number;
  bytes: number;
}

export interface UploadedMedia {
  imageKey: string;
  variants: {
    hero: VariantInfo;
    thumbnail: VariantInfo;
  };
}

export interface UploadMediaPayload {
  file: File;
}

const prefix = `/upload/v1`;
/**
 * 이미지 업로드 → 백엔드가 sharp로 webp 변환·리사이즈 후 공개 URL을 돌려준다.
 * 반환 url을 공지 썸네일(thumbnailUrl) 또는 본문 <img src>로 그대로 쓴다.
 */
export async function uploadMedia(file: File): Promise<UploadedMedia> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await http.post<UploadedMedia>(`${prefix}`, formData, {
    // 원본이 큰 이미지는 sharp 처리에 시간이 걸린다. 기본 10초로는 부족할 수 있다.
    timeout: 30_000,
  });
  return data;
}
