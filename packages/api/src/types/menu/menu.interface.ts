import type { MenuOptionGroup } from "./menuOptions.interface";

export interface MenuImages {
  hero: string;
  thumbnail: string;
}

/**
 * 메뉴 응답. 서버는 `id`·`categoryId`와 관계 필드를 제외하고 내려준다.
 *
 * 옵션은 실리지 않는다 — 옵션이 바뀔 때마다 메뉴 캐시까지 무효화하지 않도록
 * `GET /stores/{storeId}/menus/{menuId}/options`로 따로 조회한다.
 */
export interface Menu {
  publicId: string;
  name: string;
  price: number;
  description: string | null;
  images: MenuImages | null;
  isAvailable: boolean;
  categoryId: string;
  /** 카테고리 내 표시 순서 (Sparse 패턴: 10, 20, 30...) */
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  /** 소프트 삭제 시각. 응답에 포함되지만 삭제된 메뉴는 조회에서 걸러지므로 항상 null이다. */
  deletedAt: string | null;
}

/**
 * 복구 가능한 소프트 삭제 메뉴. `GET /stores/{storeId}/menus/deleted` 응답이다.
 *
 * 보관 기간(MENU_RETENTION_DAYS)은 S3 lifecycle 정책을 따라가는 백엔드 상수라
 * 프론트가 복제하지 않는다 — 만료 시각을 서버가 계산해 내려준다.
 */
export interface RestorableMenu extends Menu {
  /** 소프트 삭제 시각. 이 응답에서는 항상 값이 있다. */
  deletedAt: string;
  /** 복구 가능 만료 시각. 서버가 `deletedAt + MENU_RETENTION_MS`로 계산한다. */
  restorableUntil: string;
}

/**
 * 옵션을 함께 실은 메뉴. 고객 메뉴판 전용이다 —
 * 주문 화면은 한 번의 요청으로 전부 렌더해야 해서 옵션을 나눠 받을 이유가 없다.
 */
export interface MenuWithOptions extends Menu {
  /** 옵션 그룹 목록. 옵션이 없으면 빈 배열이며 null이 되지 않는다. */
  options: MenuOptionGroup[];
}
