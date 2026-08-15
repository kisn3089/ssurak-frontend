export const MenuDraftIssue = {
  PRICE_MISSING: "PRICE_MISSING",
  PRICE_OUT_OF_RANGE: "PRICE_OUT_OF_RANGE",
  PRICE_ROUNDED: "PRICE_ROUNDED",
  NAME_TRUNCATED: "NAME_TRUNCATED",
  DESCRIPTION_TRUNCATED: "DESCRIPTION_TRUNCATED",
  CATEGORY_UNKNOWN: "CATEGORY_UNKNOWN",
  DUPLICATE_NAME: "DUPLICATE_NAME",
} as const;
export type MenuDraftIssue =
  (typeof MenuDraftIssue)[keyof typeof MenuDraftIssue];

/**
 * 추출이 동기(POST가 결과까지 기다린다)라 `EXTRACTING`은 없다 — 리소스의 존재가 곧 완료다.
 * 일괄 등록(`POST .../menus/bulk`)은 아직 초안을 알지 못하므로 등록 후에도 `READY`로 남는다.
 */
export const MenuDraftStatus = {
  READY: "READY",
  COMMITTED: "COMMITTED",
} as const;
export type MenuDraftStatus =
  (typeof MenuDraftStatus)[keyof typeof MenuDraftStatus];

export type MenuDraftCategory =
  | { kind: "existing"; categoryId: string; name: string }
  | { kind: "new"; name: string }
  | { kind: "unknown" };

export interface MenuDraftItem {
  name: string;
  price: number | null;
  description: string | null;
  category: MenuDraftCategory;
  issues: MenuDraftIssue[];
}

export interface MenuDraftSourceImage {
  fileName: string;
  byteSize: number;
  thumbnail: string;
}

export interface MenuDraftSummary {
  draftId: string;
  status: MenuDraftStatus;
  itemCount: number;
  sourceImages: MenuDraftSourceImage[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface MenuDraftResponse extends MenuDraftSummary {
  items: MenuDraftItem[];
  unreadableCount: number;
}

export interface MenuDraftListResponse {
  drafts: MenuDraftSummary[];
  remaining: number | null;
  resetAt: string | null;
}
