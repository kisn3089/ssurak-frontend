import { HttpAxiosError } from "../../../axios/http";

/**
 * 메뉴 옵션·선택지 요청의 백엔드 오류를 사용자 문구로 변환한다.
 *
 * 오류 출처 (ssurak-api `:storeId/menus/:menuId/options`, `:storeId/options/:optionId`,
 * `:storeId/choices/:choiceId` 라우트 기준):
 * - JwtAuthGuard: 401 — 토큰 만료(419)는 axios 인터셉터가 자동 갱신하므로 여기서 다루지 않는다.
 * - StoreAccessGuard: 404(매장 없음) / 403(소유자 불일치)
 * - ZodValidation: 400 ZOD_PAYLOAD_FAILED — 그룹 단독으로 판정 가능한 규칙
 * - MenuOptionService(HttpException):
 *   - 400 MENU_OPTION_CONSTRAINT_VIOLATION — 저장값과 합쳐야 판정 가능한 규칙(부분 수정).
 *     `details.reason`에 사람이 읽을 수 있는 이유가 들어 있어 그대로 노출한다.
 *   - 400 MENU_OPTION_TRIGGER_INVALID — 트리거가 같은 메뉴에 없는 옵션·선택지를 가리킴
 *   - 400 MENU_OPTION_TRIGGER_CYCLE — 자기 참조 또는 순환 참조
 *   - 409 MENU_OPTION_LAST_CHOICE — 옵션의 마지막 선택지 삭제 시도
 *   - 409 MENU_OPTION_ORDER_MISMATCH / OPTION_CHOICE_ORDER_MISMATCH — 재정렬 집합 불일치
 * - GlobalExceptionFilter(Prisma):
 *   - P2002 → 409 — @@unique([menuId, name]) / @@unique([optionGroupId, name]) 이름 중복
 *   - P2025 → 404 — 대상 메뉴·옵션·선택지 없음
 */
export const httpMenuOptionErrors = {
  post: postMenuOptionErrors,
  get: getMenuOptionErrors,
  patch: patchMenuOptionErrors,
  reorder: reorderMenuOptionErrors,
  delete: deleteMenuOptionErrors,
};

/**
 * 재정렬 요청의 id 집합이 서버의 현재 목록과 어긋났는지 판단한다.
 * "요청이 틀렸다"가 아니라 "내가 들고 있던 목록이 낡았다"는 신호라 재시도로 회복할 수 있다.
 */
export function isOptionOrderMismatch(error: HttpAxiosError) {
  const code = error.response?.data?.code;
  return (
    code === "MENU_OPTION_ORDER_MISMATCH" ||
    code === "OPTION_CHOICE_ORDER_MISMATCH"
  );
}

/**
 * 서버가 이유를 문장으로 내려주는 제약 위반은 그 문장을 그대로 쓴다 —
 * 여기서 다시 쓰면 규칙이 늘어날 때마다 두 곳을 고쳐야 하고 금세 어긋난다.
 */
function constraintReason(error: HttpAxiosError): string | undefined {
  if (error.response?.data?.code !== "MENU_OPTION_CONSTRAINT_VIOLATION") {
    return undefined;
  }

  const { reason } = error.response.data.details ?? {};
  return typeof reason === "string" ? reason : undefined;
}

function triggerError(error: HttpAxiosError): string | undefined {
  switch (error.response?.data?.code) {
    case "MENU_OPTION_TRIGGER_INVALID":
      return "조건으로 고른 옵션이나 선택지를 찾을 수 없어요. 다시 골라 주세요.";
    case "MENU_OPTION_TRIGGER_CYCLE":
      return "옵션들이 서로를 조건으로 걸고 있어요. 이렇게 저장하면 모두 노출되지 않아요.";
    default:
      return undefined;
  }
}

/** 모든 옵션 요청에 공통으로 발생할 수 있는 인증/권한/서버 오류를 처리한다. */
function commonMenuOptionError(
  error: HttpAxiosError,
  fallback: string
): string {
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

function postMenuOptionErrors(error: HttpAxiosError) {
  const status = error.response?.data?.status;
  switch (status) {
    case 400:
      return (
        constraintReason(error) ??
        triggerError(error) ??
        "입력한 옵션 정보가 올바르지 않아요. 다시 확인해 주세요."
      );
    case 404:
      return "옵션을 추가할 메뉴를 찾을 수 없어요.";
    case 409:
      return "이미 있는 이름이에요. 다른 이름을 입력해 주세요.";
    default:
      return commonMenuOptionError(
        error,
        "일시적인 서버 오류로 저장하지 못했어요. 잠시 후 다시 시도해 주세요."
      );
  }
}

function getMenuOptionErrors(error: HttpAxiosError) {
  const status = error.response?.data?.status;
  switch (status) {
    case 400:
      return "잘못된 요청이에요. 다시 시도해 주세요.";
    case 404:
      return "해당 옵션을 찾을 수 없어요.";
    default:
      return commonMenuOptionError(
        error,
        "일시적인 서버 오류로 옵션을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."
      );
  }
}

function patchMenuOptionErrors(error: HttpAxiosError) {
  const status = error.response?.data?.status;
  switch (status) {
    case 400:
      return (
        constraintReason(error) ??
        triggerError(error) ??
        "입력한 옵션 정보가 올바르지 않아요. 다시 확인해 주세요."
      );
    case 404:
      return "수정하려는 옵션을 찾을 수 없어요.";
    case 409:
      return "이미 있는 이름이에요. 다른 이름을 입력해 주세요.";
    default:
      return commonMenuOptionError(
        error,
        "일시적인 서버 오류로 수정하지 못했어요. 잠시 후 다시 시도해 주세요."
      );
  }
}

function reorderMenuOptionErrors(error: HttpAxiosError) {
  const status = error.response?.data?.status;
  switch (status) {
    case 400:
      return "정렬 정보가 올바르지 않아요. 새로고침 후 다시 시도해 주세요.";
    case 404:
      return "정렬할 옵션을 찾을 수 없어요. 새로고침 후 다시 시도해 주세요.";
    case 409:
      return "그 사이 목록이 바뀌어 순서를 저장하지 못했어요. 다시 정렬해 주세요.";
    default:
      return commonMenuOptionError(
        error,
        "일시적인 서버 오류로 순서를 저장하지 못했어요. 다시 정렬해 주세요."
      );
  }
}

function deleteMenuOptionErrors(error: HttpAxiosError) {
  const status = error.response?.data?.status;
  switch (status) {
    case 400:
      return (
        constraintReason(error) ?? "잘못된 요청이에요. 다시 시도해 주세요."
      );
    case 404:
      return "삭제하려는 항목을 찾을 수 없어요.";
    case 409:
      if (error.response?.data?.code === "MENU_OPTION_LAST_CHOICE") {
        return "마지막 선택지는 지울 수 없어요. 옵션 자체를 삭제해 주세요.";
      }
      return "지금은 삭제할 수 없어요. 새로고침 후 다시 시도해 주세요.";
    default:
      return commonMenuOptionError(
        error,
        "일시적인 서버 오류로 삭제하지 못했어요. 잠시 후 다시 시도해 주세요."
      );
  }
}
