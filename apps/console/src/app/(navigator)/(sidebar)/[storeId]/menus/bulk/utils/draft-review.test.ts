import { MenuDraftItem } from "@ssurak/api/types/menuDraft/menuDraft.interface";
import { describe, expect, it } from "vitest";
import {
  countBlockedItems,
  DraftItemFormValue,
  deriveDuplicateFlags,
  deriveItemIssues,
  toBulkPayloadItems,
  toFormValues,
  toUpdatePayloadItems,
} from "./draft-review";

function draftItem(overrides: Partial<MenuDraftItem> = {}): MenuDraftItem {
  return {
    name: "김치찌개",
    price: 8000,
    description: null,
    category: { kind: "existing", categoryId: "cat1", name: "찌개류" },
    issues: [],
    ...overrides,
  };
}

function formItem(
  overrides: Partial<DraftItemFormValue> = {}
): DraftItemFormValue {
  return {
    name: "김치찌개",
    price: 8000,
    description: null,
    categoryId: "cat1",
    excluded: false,
    extractionIssues: [],
    ...overrides,
  };
}

const noExistingMenus = new Set<string>();

describe("toFormValues", () => {
  it("카테고리 판별 유니온을 폼의 두 필드로 편다", () => {
    const { items } = toFormValues([
      draftItem({
        category: { kind: "existing", categoryId: "c1", name: "찌개류" },
      }),
      draftItem({ category: { kind: "new", name: "주류" } }),
      draftItem({ category: { kind: "unknown" } }),
    ]);

    expect(items[0]).toMatchObject({ categoryId: "c1" });
    expect(items[0].categoryName).toBeUndefined();
    expect(items[1]).toMatchObject({ categoryName: "주류" });
    expect(items[1].categoryId).toBeUndefined();
    expect(items[2].categoryId).toBeUndefined();
    expect(items[2].categoryName).toBeUndefined();
  });

  it("이름이 겹치는 행은 처음부터 제외 상태로 연다", () => {
    const { items } = toFormValues([draftItem({ issues: ["DUPLICATE_NAME"] })]);

    expect(items[0].excluded).toBe(true);
  });

  it("실시간으로 다시 계산하는 표시는 서버 값에서 걷어내고 정보성만 남긴다", () => {
    const { items } = toFormValues([
      draftItem({ issues: ["CATEGORY_UNKNOWN", "NAME_TRUNCATED"] }),
    ]);

    expect(items[0].extractionIssues).toEqual(["NAME_TRUNCATED"]);
  });
});

describe("deriveDuplicateFlags", () => {
  it("매장에 이미 있는 이름을 표시한다", () => {
    const items = [formItem({ name: "김치찌개" })];

    expect(
      deriveDuplicateFlags({ items, existingMenuNames: new Set(["김치찌개"]) })
    ).toEqual([true]);
  });

  it("초안 안에서 겹친 이름을 양쪽 모두 표시한다", () => {
    const items = [formItem({ name: "공기밥" }), formItem({ name: "공기밥" })];

    expect(
      deriveDuplicateFlags({ items, existingMenuNames: noExistingMenus })
    ).toEqual([true, true]);
  });

  it("한쪽을 제외하면 초안 안의 중복 표시가 풀린다", () => {
    const items = [
      formItem({ name: "공기밥" }),
      formItem({ name: "공기밥", excluded: true }),
    ];

    expect(
      deriveDuplicateFlags({ items, existingMenuNames: noExistingMenus })[0]
    ).toBe(false);
  });

  it("이름이 비어 있으면 중복으로 보지 않는다", () => {
    const items = [formItem({ name: "  " }), formItem({ name: "" })];

    expect(
      deriveDuplicateFlags({ items, existingMenuNames: noExistingMenus })
    ).toEqual([false, false]);
  });
});

describe("deriveItemIssues", () => {
  it("가격과 카테고리가 비면 각각 표시한다", () => {
    const item = formItem({ price: null, categoryId: undefined });

    expect(deriveItemIssues({ item, isDuplicate: false })).toEqual([
      "PRICE_MISSING",
      "CATEGORY_UNKNOWN",
    ]);
  });

  it("서버 상한을 넘는 가격을 표시한다", () => {
    const item = formItem({ price: 10_000_001 });

    expect(deriveItemIssues({ item, isDuplicate: false })).toEqual([
      "PRICE_OUT_OF_RANGE",
    ]);
  });

  it("중복 여부는 바깥에서 받은 값을 그대로 싣는다", () => {
    const item = formItem();

    expect(deriveItemIssues({ item, isDuplicate: true })).toEqual([
      "DUPLICATE_NAME",
    ]);
  });

  it("추출 시점 표시를 실시간 표시 뒤에 붙인다", () => {
    const item = formItem({ price: null, extractionIssues: ["PRICE_ROUNDED"] });

    expect(deriveItemIssues({ item, isDuplicate: false })).toEqual([
      "PRICE_MISSING",
      "PRICE_ROUNDED",
    ]);
  });
});

describe("countBlockedItems", () => {
  it("가격이나 카테고리를 못 채운 행을 센다", () => {
    const blocked = countBlockedItems([
      formItem({ price: null }),
      formItem({ categoryId: undefined }),
      formItem(),
    ]);

    expect(blocked).toBe(2);
  });

  it("제외한 행은 세지 않는다", () => {
    const blocked = countBlockedItems([
      formItem({ price: null, excluded: true }),
    ]);

    expect(blocked).toBe(0);
  });

  it("중복은 등록을 막지 않는다 — 서버가 동명 메뉴를 허용한다", () => {
    const blocked = countBlockedItems([
      formItem({ name: "김치찌개", extractionIssues: ["DUPLICATE_NAME"] }),
    ]);

    expect(blocked).toBe(0);
  });
});

describe("toUpdatePayloadItems", () => {
  it("제외한 행도 저장한다 — 제외는 등록 대상에서 빼는 것일 뿐이다", () => {
    const payload = toUpdatePayloadItems([
      formItem({ name: "김치찌개" }),
      formItem({ name: "공기밥", excluded: true }),
    ]);

    expect(payload).toHaveLength(2);
    expect(payload[1].name).toBe("공기밥");
  });

  it("비어 있는 카테고리 필드는 아예 싣지 않는다", () => {
    const [payload] = toUpdatePayloadItems([
      formItem({ categoryId: undefined }),
    ]);

    expect("categoryId" in payload).toBe(false);
    expect("categoryName" in payload).toBe(false);
  });
});

describe("toBulkPayloadItems", () => {
  it("제외한 행과 아직 못 채운 행을 뺀다", () => {
    const payload = toBulkPayloadItems([
      formItem({ name: "김치찌개" }),
      formItem({ name: "공기밥", excluded: true }),
      formItem({ name: "오늘의 특선", price: null }),
      formItem({ name: "소주", categoryId: undefined }),
    ]);

    expect(payload.map((item) => item.name)).toEqual(["김치찌개"]);
  });

  it("새 카테고리는 이름으로 싣는다 — 등록 시점에 서버가 만든다", () => {
    const [payload] = toBulkPayloadItems([
      formItem({ categoryId: undefined, categoryName: "주류" }),
    ]);

    expect(payload).toMatchObject({ categoryName: "주류", isAvailable: true });
    expect("categoryId" in payload).toBe(false);
  });
});
