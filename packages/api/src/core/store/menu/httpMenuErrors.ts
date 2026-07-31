import { HttpAxiosError } from "../../axios/http";

/**
 * Menu 조회/생성/수정/삭제 시 발생 가능한 백엔드 오류를 사용자 문구로 변환한다.
 *
 * 오류 출처 (ssurak-api `:storeId/menus` 라우트 기준):
 * - JwtAuthGuard: 401 UNAUTHORIZED — 토큰 만료(419)는 axios 인터셉터가 자동 갱신하므로 여기서 다루지 않는다.
 * - StoreAccessGuard: 404 NOT_FOUND(매장 없음), 403 FORBIDDEN(매장 소유자 불일치)
 * - ZodValidation: 400 (params/body 검증 실패)
 * - GlobalExceptionFilter(Prisma):
 *   - P2025 → 404 RESOURCE_NOT_FOUND — 대상 메뉴 없음, 또는 생성·수정 시
 *     categoryId 검증(assertCategoryBelongsToStore)의 카테고리 없음.
 *     `details.resource`("Menu" | "Category")로 구분한다.
 *   - Menu는 publicId 외 unique 제약이 없어 P2002(409)는 발생하지 않는다.
 *   - 삭제는 soft delete(deletedAt update)라 P2003(FK Restrict)도 발생하지 않는다.
 *   - 그 외 → 400 PRISMA_ERROR / 500 INTERNAL_SERVER_ERROR
 */
export const httpMenuErrors = {
  post: postMenuErrors,
  get: getMenuErrors,
  patch: patchMenuErrors,
  reorder: reorderMenusErrors,
  delete: deleteMenuErrors,
};

/** 모든 메뉴 요청에 공통으로 발생할 수 있는 인증/권한/서버 오류를 처리한다. */
function commonMenuError(error: HttpAxiosError, fallback: string): string {
  const status = error.response?.data?.status;
  switch (status) {
    case 401:
      return "로그인이 만료되었어요. 다시 로그인해 주세요.";
    case 403:
      return "이 매장에 접근할 권한이 없어요.";
    default:
      return fallback;
  }
}

/** P2025(404)의 대상이 카테고리인지 여부 (생성·수정 시 categoryId 검증 실패) */
function isCategoryNotFound(error: HttpAxiosError): boolean {
  return error.response?.data?.details?.resource === "Category";
}

function postMenuErrors(error: HttpAxiosError) {
  const status = error.response?.data?.status;
  switch (status) {
    case 400:
      return "입력한 메뉴 정보가 올바르지 않아요. 다시 확인해 주세요.";
    case 404:
      if (isCategoryNotFound(error)) {
        return "선택한 카테고리를 찾을 수 없어요. 새로고침 후 다시 시도해 주세요.";
      }
      return "메뉴를 추가할 매장을 찾을 수 없어요.";
    default:
      return commonMenuError(
        error,
        "일시적인 서버 오류로 저장하지 못했어요. 잠시 후 다시 시도해 주세요."
      );
  }
}

function getMenuErrors(error: HttpAxiosError) {
  const status = error.response?.data?.status;
  switch (status) {
    case 400:
      return "잘못된 요청이에요. 다시 시도해 주세요.";
    case 404:
      return "해당 메뉴를 찾을 수 없어요.";
    default:
      return commonMenuError(
        error,
        "일시적인 서버 오류로 데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요."
      );
  }
}

function patchMenuErrors(error: HttpAxiosError) {
  const status = error.response?.data?.status;
  switch (status) {
    case 400:
      return "입력한 메뉴 정보가 올바르지 않아요. 다시 확인해 주세요.";
    case 404:
      if (isCategoryNotFound(error)) {
        return "선택한 카테고리를 찾을 수 없어요. 새로고침 후 다시 시도해 주세요.";
      }
      return "수정하려는 메뉴를 찾을 수 없어요.";
    default:
      return commonMenuError(
        error,
        "일시적인 서버 오류로 수정하지 못했어요. 잠시 후 다시 시도해 주세요."
      );
  }
}

/**
 * 재정렬은 카테고리의 살아 있는 메뉴 집합 전체를 보내고 서버가 대조하므로,
 * 그 사이 다른 곳에서 메뉴가 추가·삭제·이동됐다면 409로 거절된다.
 */
function reorderMenusErrors(error: HttpAxiosError) {
  const status = error.response?.data?.status;
  switch (status) {
    case 400:
      return "정렬 정보가 올바르지 않아요. 새로고침 후 다시 시도해 주세요.";
    case 404:
      if (isCategoryNotFound(error)) {
        return "정렬할 카테고리를 찾을 수 없어요. 새로고침 후 다시 시도해 주세요.";
      }
      return "정렬할 메뉴를 찾을 수 없어요. 새로고침 후 다시 시도해 주세요.";
    case 409:
      return "그 사이 메뉴 목록이 바뀌어 순서를 저장하지 못했어요. 메뉴 목록에서 다시 정렬해 주세요.";
    default:
      return commonMenuError(
        error,
        "일시적인 서버 오류로 순서를 저장하지 못했어요. 메뉴 목록에서 다시 정렬해 주세요."
      );
  }
}

function deleteMenuErrors(error: HttpAxiosError) {
  const status = error.response?.data?.status;
  switch (status) {
    case 400:
      return "잘못된 요청이에요. 다시 시도해 주세요.";
    case 404:
      return "삭제하려는 메뉴를 찾을 수 없어요.";
    default:
      return commonMenuError(
        error,
        "일시적인 서버 오류로 삭제하지 못했어요. 잠시 후 다시 시도해 주세요."
      );
  }
}
