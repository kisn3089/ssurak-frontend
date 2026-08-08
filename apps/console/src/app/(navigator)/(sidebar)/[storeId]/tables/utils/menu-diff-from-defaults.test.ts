import { describe, expect, it } from "vitest";
import { menuDiffFromDefaults } from "./menu-diff-from-defaults";
import { MenuFormValues } from "../types/menu-form.type";
import { CreateMenuPayload } from "@ssurak/api/schemas/model/menu.schema";

const defaults: MenuFormValues = {
  name: "아메리카노",
  price: 4000,
  categoryId: "category-1",
  isAvailable: true,
  imageKey: "menu/americano.png",
  description: "깔끔한 아메리카노",
};

const baseForm: CreateMenuPayload = {
  name: "아메리카노",
  price: 4000,
  categoryId: "category-1",
  isAvailable: true,
  imageKey: "menu/americano.png",
  description: "깔끔한 아메리카노",
};

describe("menuDiffFromDefaults", () => {
  it("변경이 없으면 빈 객체를 반환한다", () => {
    const result = menuDiffFromDefaults({ ...baseForm }, defaults);

    expect(result).toEqual({});
  });

  it("변경된 필드만 포함한다", () => {
    const result = menuDiffFromDefaults(
      { ...baseForm, name: "카페라떼", price: 4500 },
      defaults
    );

    expect(result).toEqual({ name: "카페라떼", price: 4500 });
  });

  it("price를 0으로 바꾸면 0을 보낸다", () => {
    const result = menuDiffFromDefaults({ ...baseForm, price: 0 }, defaults);

    expect(result).toEqual({ price: 0 });
  });

  it("categoryId 변경을 감지한다", () => {
    const result = menuDiffFromDefaults(
      { ...baseForm, categoryId: "category-2" },
      defaults
    );

    expect(result).toEqual({ categoryId: "category-2" });
  });

  it("isAvailable 토글을 감지한다", () => {
    const result = menuDiffFromDefaults(
      { ...baseForm, isAvailable: false },
      defaults
    );

    expect(result).toEqual({ isAvailable: false });
  });

  it("imageKey를 null로 비우면 null을 보낸다", () => {
    const result = menuDiffFromDefaults(
      { ...baseForm, imageKey: null },
      defaults
    );

    expect(result).toEqual({ imageKey: null });
  });

  it("description을 비우면 값 해제 의미의 null을 보낸다", () => {
    const result = menuDiffFromDefaults(
      { ...baseForm, description: undefined },
      defaults
    );

    expect(result).toEqual({ description: null });
  });

  it("description을 빈 문자열로 지우면 null로 정규화해 보낸다", () => {
    const result = menuDiffFromDefaults(
      { ...baseForm, description: "" },
      defaults
    );

    expect(result).toEqual({ description: null });
  });

  it("description이 양쪽 모두 비어 있으면(undefined) 변경으로 치지 않는다", () => {
    const emptyDescription: MenuFormValues = {
      ...defaults,
      description: undefined,
    };

    const result = menuDiffFromDefaults(
      { ...baseForm, description: undefined },
      emptyDescription
    );

    expect(result).toEqual({});
  });

  it("여러 필드를 동시에 변경하면 변경된 필드만 모아서 반환한다", () => {
    const result = menuDiffFromDefaults(
      {
        ...baseForm,
        name: "카페라떼",
        price: 4500,
        isAvailable: false,
        description: undefined,
      },
      defaults
    );

    expect(result).toEqual({
      name: "카페라떼",
      price: 4500,
      isAvailable: false,
      description: null,
    });
  });
});
