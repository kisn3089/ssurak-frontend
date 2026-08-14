import { HttpAxiosError } from "../../../axios/http";

/**
 * 메뉴 초안 요청의 백엔드 오류를 사용자 문구로 변환한다.
 *
 * 오류 출처 (ssurak-api `:storeId/menus/drafts` 라우트 기준):
 * - JwtAuthGuard: 401 UNAUTHORIZED — 419(토큰 만료)는 axios 인터셉터가 갱신하므로 다루지 않는다.
 * - StoreAccessGuard: 404(매장 없음), 403(소유자 불일치)
 * - ZodValidation: 400 (params/body 검증 실패)
 * - MenuDraftService:
 *   - 422 UNPROCESSABLE_ENTITY — 직전에 같은 사진으로 실패한 기록이 남아 있다(10분간 캐싱).
 *   - 429 TOO_MANY_REQUESTS — 시간당 인식 횟수 초과. 서버가 남은 시간을 문구로 내려준다.
 *   - 503 SERVICE_UNAVAILABLE — Redis 또는 비전 모델을 쓸 수 없다.
 *   - 404 NOT_FOUND — 초안이 만료됐거나 없는 draftId다.
 */
export const httpMenuDraftErrors = {
  post: postMenuDraftErrors,
  get: getMenuDraftErrors,
  patch: patchMenuDraftErrors,
};

/** 서버가 상황별 문구(남은 횟수·만료 안내)를 내려주면 그대로 쓰는 편이 정확하다. */
function serverMessage(error: HttpAxiosError) {
  return error.response?.data?.message;
}

function commonMenuDraftError(error: HttpAxiosError, fallback: string): string {
  const status = error.response?.data?.status;
  switch (status) {
    case 401:
      return "로그인이 만료되었어요. 다시 로그인해 주세요.";
    case 403:
      return "이 매장에 접근할 권한이 없어요.";
    case 503:
      return (
        serverMessage(error) ??
        "메뉴 인식을 일시적으로 사용할 수 없어요. 잠시 후 다시 시도해 주세요."
      );
    default:
      return fallback;
  }
}

function postMenuDraftErrors(error: HttpAxiosError) {
  const status = error.response?.data?.status;
  switch (status) {
    case 400:
      return error.response?.data.message;
    case 422:
      return (
        serverMessage(error) ??
        "이 사진에서는 메뉴를 찾지 못했어요. 글자가 잘 보이는 사진으로 다시 올려주세요."
      );
    case 429:
      return (
        serverMessage(error) ??
        "메뉴 인식 사용 횟수를 모두 썼어요. 잠시 후 다시 시도해 주세요."
      );
    default:
      return commonMenuDraftError(
        error,
        "사진에서 메뉴를 읽지 못했어요. 잠시 후 다시 시도해 주세요."
      );
  }
}

function getMenuDraftErrors(error: HttpAxiosError) {
  const status = error.response?.data?.status;
  switch (status) {
    case 404:
      return (
        serverMessage(error) ??
        "추출 결과를 찾을 수 없어요. 12시간이 지나 만료되었을 수 있어요."
      );
    default:
      return commonMenuDraftError(
        error,
        "추출 결과를 불러오지 못했어요. 잠시 후 다시 시도해 주세요."
      );
  }
}

function patchMenuDraftErrors(error: HttpAxiosError) {
  const status = error.response?.data?.status;
  switch (status) {
    case 400:
      return error.response?.data.message;
    case 404:
      return (
        serverMessage(error) ??
        "추출 결과가 만료되어 저장하지 못했어요. 사진을 다시 올려주세요."
      );
    default:
      return commonMenuDraftError(
        error,
        "수정한 내용을 저장하지 못했어요. 잠시 후 다시 시도해 주세요."
      );
  }
}
