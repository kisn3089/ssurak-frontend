import { describe, expect, it } from "vitest";
import { menuDiffFromDefaults } from "./menu-diff-from-defaults";
import { MenuFormValues } from "../types/menu-form.type";
import { CreateMenuPayload } from "@ssurak/api/schemas/model/menu.schema";
import { MenuCustomOption } from "@ssurak/api/types/menu/menuOptions.interface";

const defaults: MenuFormValues = {
  name: "아메리카노",
  price: 4000,
  categoryId: "category-1",
  sortOrder: 1,
  isAvailable: true,
  imageKey: "menu/americano.png",
  description: "깔끔한 아메리카노",
  requiredOptions: undefined,
  customOptions: undefined,
};

const baseForm: CreateMenuPayload = {
  name: "아메리카노",
  price: 4000,
  categoryId: "category-1",
  sortOrder: 1,
  isAvailable: true,
  imageKey: "menu/americano.png",
  description: "깔끔한 아메리카노",
  requiredOptions: undefined,
  customOptions: undefined,
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

  it("sortOrder를 0으로 바꾸면 0을 보낸다", () => {
    const result = menuDiffFromDefaults(
      { ...baseForm, sortOrder: 0 },
      defaults
    );

    expect(result).toEqual({ sortOrder: 0 });
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

  it("customOptions를 새로 설정하면 해당 객체를 보낸다", () => {
    const customOptions: MenuCustomOption = {
      shot: {
        options: [{ key: "extra", price: 500 }],
        defaultKey: "extra",
      },
    };

    const result = menuDiffFromDefaults(
      { ...baseForm, customOptions },
      defaults
    );

    expect(result).toEqual({ customOptions });
  });

  it("customOptions를 제거하면 값 해제 의미의 null을 보낸다", () => {
    const withOptions: MenuFormValues = {
      ...defaults,
      customOptions: {
        shot: {
          options: [{ key: "extra", price: 500 }],
          defaultKey: "extra",
        },
      },
    };

    const result = menuDiffFromDefaults(
      { ...baseForm, customOptions: undefined },
      withOptions
    );

    expect(result).toEqual({ customOptions: null });
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

  it("옵션 내용이 같으면 인스턴스가 달라도 변경으로 치지 않는다", () => {
    const withOptions: MenuFormValues = {
      ...defaults,
      customOptions: {
        shot: {
          options: [{ key: "extra", price: 500 }],
          defaultKey: "extra",
        },
      },
    };

    // 서버 defaults 와 내용은 같지만 새로 만들어진 별개 인스턴스(RHF 클론 상황 재현)
    const result = menuDiffFromDefaults(
      {
        ...baseForm,
        customOptions: {
          shot: {
            options: [{ key: "extra", price: 500 }],
            defaultKey: "extra",
          },
        },
      },
      withOptions
    );

    expect(result).toEqual({});
  });

  it("record 키 순서만 다르면 변경으로 치지 않는다", () => {
    const withOptions: MenuFormValues = {
      ...defaults,
      customOptions: {
        shot: { options: [{ key: "extra", price: 500 }], defaultKey: "extra" },
        size: { options: [{ key: "large", price: 700 }], defaultKey: "large" },
      },
    };

    const result = menuDiffFromDefaults(
      {
        ...baseForm,
        customOptions: {
          size: {
            options: [{ key: "large", price: 700 }],
            defaultKey: "large",
          },
          shot: {
            options: [{ key: "extra", price: 500 }],
            defaultKey: "extra",
          },
        },
      },
      withOptions
    );

    expect(result).toEqual({});
  });

  it("옵션 내용이 실제로 바뀌면 변경으로 감지한다", () => {
    const withOptions: MenuFormValues = {
      ...defaults,
      customOptions: {
        shot: { options: [{ key: "extra", price: 500 }], defaultKey: "extra" },
      },
    };

    const changedOptions: MenuCustomOption = {
      shot: { options: [{ key: "extra", price: 800 }], defaultKey: "extra" },
    };

    const result = menuDiffFromDefaults(
      { ...baseForm, customOptions: changedOptions },
      withOptions
    );

    expect(result).toEqual({ customOptions: changedOptions });
  });

  it("옵션 배열 순서가 바뀌면 변경으로 감지한다", () => {
    const withOptions: MenuFormValues = {
      ...defaults,
      customOptions: {
        shot: {
          options: [
            { key: "extra", price: 500 },
            { key: "double", price: 900 },
          ],
          defaultKey: "extra",
        },
      },
    };

    const reordered: MenuCustomOption = {
      shot: {
        options: [
          { key: "double", price: 900 },
          { key: "extra", price: 500 },
        ],
        defaultKey: "extra",
      },
    };

    const result = menuDiffFromDefaults(
      { ...baseForm, customOptions: reordered },
      withOptions
    );

    expect(result).toEqual({ customOptions: reordered });
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
