import { HttpAxiosError } from "../../axios/http";

/**
 * Category 조회/생성/수정/재정렬/삭제 시 발생 가능한 백엔드 오류를 사용자 문구로 변환한다.
 *
 * 오류 출처 (ssurak-api `:storeId/categories` 라우트 기준):
 * - JwtAuthGuard: 401 UNAUTHORIZED — 토큰 만료(419)는 axios 인터셉터가 자동 갱신하므로 여기서 다루지 않는다.
 * - StoreAccessGuard: 404 NOT_FOUND(매장 없음), 403 FORBIDDEN(매장 소유자 불일치)
 * - ZodValidation: 400 (params/body 검증 실패)
 * - CategoryService(HttpException):
 *   - 409 CATEGORY_HAS_MENUS — 메뉴가 남아 있는 카테고리 삭제 시도.
 *     카테고리 삭제는 하드 삭제인데 Menu.categoryId가 필수라 옮길 곳이 없어,
 *     소프트 삭제된 메뉴까지 포함해 한 건이라도 있으면 서버가 먼저 막는다.
 *   - 409 CATEGORY_ORDER_MISMATCH — 재정렬 요청의 id 집합이 서버의 현재 목록과 불일치(assertSameSet).
 * - GlobalExceptionFilter(Prisma):
 *   - P2002 → 409 UNIQUE_CONSTRAINT_VIOLATION (@@unique([storeId, name]) 위반: 같은 매장 내 카테고리 이름 중복)
 *   - P2025 → 404 RESOURCE_NOT_FOUND (조회·수정·삭제 대상 카테고리 없음)
 *   - 삭제는 서비스가 메뉴 존재를 먼저 검사하므로 P2003(FK 위반)까지 내려가지 않는다.
 *   - 그 외 → 400 PRISMA_ERROR / 500 INTERNAL_SERVER_ERROR
 */
export const httpCategoryErrors = {
  post: postCategoryErrors,
  get: getCategoryErrors,
  patch: patchCategoryErrors,
  reorder: reorderCategoriesErrors,
  delete: deleteCategoryErrors,
};

/** 모든 카테고리 요청에 공통으로 발생할 수 있는 인증/권한/서버 오류를 처리한다. */
function commonCategoryError(error: HttpAxiosError, fallback: string): string {
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

function postCategoryErrors(error: HttpAxiosError) {
  const status = error.response?.data?.status;
  switch (status) {
    case 400:
      return "입력한 카테고리 정보가 올바르지 않아요. 다시 확인해 주세요.";
    case 404:
      return "카테고리를 추가할 매장을 찾을 수 없어요.";
    case 409:
      return "이미 있는 카테고리 이름이에요. 다른 이름을 입력해 주세요.";
    default:
      return commonCategoryError(
        error,
        "일시적인 서버 오류로 저장하지 못했어요. 잠시 후 다시 시도해 주세요."
      );
  }
}

function getCategoryErrors(error: HttpAxiosError) {
  const status = error.response?.data?.status;
  switch (status) {
    case 400:
      return "잘못된 요청이에요. 다시 시도해 주세요.";
    case 404:
      return "해당 카테고리를 찾을 수 없어요.";
    default:
      return commonCategoryError(
        error,
        "일시적인 서버 오류로 데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요."
      );
  }
}

function patchCategoryErrors(error: HttpAxiosError) {
  const status = error.response?.data?.status;
  switch (status) {
    case 400:
      return "입력한 카테고리 정보가 올바르지 않아요. 다시 확인해 주세요.";
    case 404:
      return "수정하려는 카테고리를 찾을 수 없어요.";
    case 409:
      return "이미 있는 카테고리 이름이에요. 다른 이름을 입력해 주세요.";
    default:
      return commonCategoryError(
        error,
        "일시적인 서버 오류로 수정하지 못했어요. 잠시 후 다시 시도해 주세요."
      );
  }
}

/**
 * 재정렬은 매장의 카테고리 집합 전체를 보내고 서버가 대조하므로,
 * 그 사이 다른 곳에서 카테고리가 추가·삭제됐다면 409로 거절된다.
 */
function reorderCategoriesErrors(error: HttpAxiosError) {
  const status = error.response?.data?.status;
  switch (status) {
    case 400:
      return "정렬 정보가 올바르지 않아요. 새로고침 후 다시 시도해 주세요.";
    case 404:
      return "정렬할 카테고리를 찾을 수 없어요. 새로고침 후 다시 시도해 주세요.";
    case 409:
      return "그 사이 카테고리 목록이 바뀌어 순서를 저장하지 못했어요. 카테고리 목록에서 다시 정렬해 주세요.";
    default:
      return commonCategoryError(
        error,
        "일시적인 서버 오류로 순서를 저장하지 못했어요. 카테고리 목록에서 다시 정렬해 주세요."
      );
  }
}

function deleteCategoryErrors(error: HttpAxiosError) {
  const status = error.response?.data?.status;
  const code = error.response?.data?.code;
  switch (status) {
    case 400:
      return "잘못된 요청이에요. 다시 시도해 주세요.";
    case 404:
      return "삭제하려는 카테고리를 찾을 수 없어요.";
    case 409:
      // 소프트 삭제된 메뉴도 categoryId를 붙들고 있어 삭제 대상에 포함된다.
      if (code === "CATEGORY_HAS_MENUS") {
        return "메뉴가 남아 있는 카테고리는 삭제할 수 없어요. 메뉴를 옮기거나 삭제한 뒤 다시 시도해 주세요.";
      }
      return "지금은 카테고리를 삭제할 수 없어요. 새로고침 후 다시 시도해 주세요.";
    default:
      return commonCategoryError(
        error,
        "일시적인 서버 오류로 삭제하지 못했어요. 잠시 후 다시 시도해 주세요."
      );
  }
}
