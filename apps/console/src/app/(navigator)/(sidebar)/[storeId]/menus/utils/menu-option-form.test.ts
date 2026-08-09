import {
  MenuOptionChoice,
  OptionChoiceState,
} from "@ssurak/api/types/menu/menuOptions.interface";
import { describe, expect, it } from "vitest";
import { OptionValueForm } from "../types/option-form.type";
import {
  planChoiceChanges,
  resolveChoiceOrder,
  toOptionFieldPath,
} from "./menu-option-form";

function savedChoice(
  overrides: Partial<MenuOptionChoice> & Pick<MenuOptionChoice, "publicId">
): MenuOptionChoice {
  return {
    name: "케냐",
    priceDelta: 0,
    quantityEnabled: false,
    maxQuantity: 1,
    isDefault: false,
    sortOrder: 10,
    state: OptionChoiceState.AVAILABLE,
    ...overrides,
  };
}

function formChoice(overrides: Partial<OptionValueForm> = {}): OptionValueForm {
  return {
    name: "케냐",
    priceDelta: 0,
    quantityEnabled: false,
    maxQuantity: 1,
    isDefault: false,
    state: OptionChoiceState.AVAILABLE,
    ...overrides,
  };
}

describe("planChoiceChanges", () => {
  it("바뀐 게 없으면 아무 요청도 만들지 않는다", () => {
    const saved = [savedChoice({ publicId: "choice1" })];
    const plan = planChoiceChanges(saved, [
      formChoice({ publicId: "choice1" }),
    ]);

    expect(plan.creates).toHaveLength(0);
    expect(plan.updates).toHaveLength(0);
    expect(plan.deletes).toHaveLength(0);
  });

  it("바뀐 필드가 있는 행만 수정 대상이 된다", () => {
    const saved = [
      savedChoice({ publicId: "choice1" }),
      savedChoice({ publicId: "choice2", name: "콜롬비아" }),
    ];
    const plan = planChoiceChanges(saved, [
      formChoice({ publicId: "choice1" }),
      formChoice({ publicId: "choice2", name: "콜롬비아", priceDelta: 500 }),
    ]);

    expect(plan.updates).toEqual([
      {
        publicId: "choice2",
        payload: {
          name: "콜롬비아",
          priceDelta: 500,
          quantityEnabled: false,
          maxQuantity: 1,
          isDefault: false,
          state: OptionChoiceState.AVAILABLE,
        },
      },
    ]);
  });

  it("publicId가 없는 행은 생성, 폼에서 빠진 행은 삭제로 간다", () => {
    const saved = [
      savedChoice({ publicId: "choice1" }),
      savedChoice({ publicId: "choice2", name: "콜롬비아" }),
    ];
    const plan = planChoiceChanges(saved, [
      formChoice({ publicId: "choice1" }),
      formChoice({ name: "에티오피아" }),
    ]);

    expect(plan.creates).toEqual([
      { index: 1, payload: expect.objectContaining({ name: "에티오피아" }) },
    ]);
    expect(plan.deletes).toEqual(["choice2"]);
  });

  /** 다른 옵션의 선택지 id를 실어 보내도 남의 행을 건드리지 않고 새로 만든다. */
  it("이 옵션에 없는 publicId는 생성으로 다룬다", () => {
    const plan = planChoiceChanges(
      [savedChoice({ publicId: "choice1" })],
      [formChoice({ publicId: "otherOptionChoice", name: "에티오피아" })]
    );

    expect(plan.creates).toHaveLength(1);
    expect(plan.updates).toHaveLength(0);
    expect(plan.deletes).toEqual(["choice1"]);
  });

  it("이름만 서로 맞바꿔도 각각 수정으로 나간다", () => {
    const saved = [
      savedChoice({ publicId: "choice1", name: "케냐" }),
      savedChoice({ publicId: "choice2", name: "콜롬비아" }),
    ];
    const plan = planChoiceChanges(saved, [
      formChoice({ publicId: "choice1", name: "콜롬비아" }),
      formChoice({ publicId: "choice2", name: "케냐" }),
    ]);

    expect(plan.updates.map(({ publicId }) => publicId)).toEqual([
      "choice1",
      "choice2",
    ]);
    expect(plan.deletes).toHaveLength(0);
  });

  it("순서는 폼 배열 순서를 그대로 따르고 새 행은 자리만 잡아 둔다", () => {
    const saved = [
      savedChoice({ publicId: "choice1" }),
      savedChoice({ publicId: "choice2", name: "콜롬비아" }),
    ];
    const plan = planChoiceChanges(saved, [
      formChoice({ name: "에티오피아" }),
      formChoice({ publicId: "choice2", name: "콜롬비아" }),
      formChoice({ publicId: "choice1" }),
    ]);

    expect(plan.order).toEqual([
      { index: 0 },
      { publicId: "choice2" },
      { publicId: "choice1" },
    ]);
  });
});

describe("resolveChoiceOrder", () => {
  it("생성 응답 id를 자리표시자에 채운다", () => {
    const order = resolveChoiceOrder(
      [{ index: 0 }, { publicId: "choice2" }],
      new Map([[0, "createdChoice"]])
    );

    expect(order).toEqual(["createdChoice", "choice2"]);
  });

  /** 생성이 실패해 id를 못 받은 자리는 빼야 재정렬 집합이 서버와 어긋나지 않는다. */
  it("id를 받지 못한 자리는 순서에서 빠진다", () => {
    const order = resolveChoiceOrder(
      [{ index: 0 }, { publicId: "choice2" }],
      new Map()
    );

    expect(order).toEqual(["choice2"]);
  });
});

describe("toOptionFieldPath", () => {
  it("옵션 자신의 필드를 그대로 옮긴다", () => {
    expect(toOptionFieldPath(["minSelect"])).toBe("minSelect");
  });

  it("선택지·조건의 중첩 경로를 옮긴다", () => {
    expect(toOptionFieldPath(["choices", 2, "name"])).toBe("choices.2.name");
    expect(toOptionFieldPath(["trigger", 0, "choiceIds"])).toBe(
      "trigger.0.choiceIds"
    );
  });

  it("모르는 경로는 undefined를 돌려 카드 전체 메시지로 보낸다", () => {
    expect(toOptionFieldPath([])).toBeUndefined();
    expect(toOptionFieldPath(["choices", 0, "publicId"])).toBeUndefined();
  });
});
