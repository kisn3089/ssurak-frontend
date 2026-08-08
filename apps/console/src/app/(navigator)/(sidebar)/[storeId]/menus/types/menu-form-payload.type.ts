import { CreateMenuPayload } from "@ssurak/api/schemas/model/menu.schema";

/**
 * 메뉴 폼 값.
 *
 * 옵션은 없다 — 옵션은 메뉴 페이로드에 실리지 않고 메뉴 상세 화면의 옵션 관리 UI에서
 * publicId 기반 API로 따로 다룬다. `sortOrder`만 폼 전용 필드다.
 */
export type MenuFormPayload = CreateMenuPayload & {
  sortOrder: string[];
};
