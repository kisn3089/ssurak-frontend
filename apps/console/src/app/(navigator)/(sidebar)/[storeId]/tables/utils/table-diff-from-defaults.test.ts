import { describe, expect, it } from "vitest";
import { tableDiffFromDefaults } from "./table-diff-from-defaults";
import { TableFormValues } from "../types/table-form.type";

const defaults: TableFormValues = {
  tableNumber: "1-1",
  seats: 4,
  floor: 1,
  section: "메인 홀",
  isActive: true,
};

describe("diffFromDefaults", () => {
  it("변경이 없으면 빈 객체를 반환한다", () => {
    const result = tableDiffFromDefaults(
      {
        tableNumber: "1-1",
        seats: 4,
        floor: 1,
        section: "메인 홀",
        isActive: true,
      },
      defaults
    );

    expect(result).toEqual({});
  });

  it("변경된 필드만 포함한다", () => {
    const result = tableDiffFromDefaults(
      {
        tableNumber: "2-2",
        seats: 4,
        floor: 1,
        section: "메인 홀",
        isActive: true,
      },
      defaults
    );

    expect(result).toEqual({ tableNumber: "2-2" });
  });

  it("옵셔널 필드를 비우면 값 해제 의미의 null을 보낸다", () => {
    const result = tableDiffFromDefaults(
      {
        tableNumber: "1-1",
        seats: undefined,
        floor: 1,
        section: undefined,
        isActive: true,
      },
      defaults
    );

    expect(result).toEqual({ seats: null, section: null });
  });

  it("section을 빈 문자열로 지우면 null로 정규화해 보낸다", () => {
    const result = tableDiffFromDefaults(
      {
        tableNumber: "1-1",
        seats: 4,
        floor: 1,
        section: "",
        isActive: true,
      },
      defaults
    );

    expect(result).toEqual({ section: null });
  });

  it("floor를 0으로 바꾸면 null이 아닌 0을 보낸다", () => {
    const result = tableDiffFromDefaults(
      {
        tableNumber: "1-1",
        seats: 4,
        floor: 0,
        section: "메인 홀",
        isActive: true,
      },
      defaults
    );

    expect(result).toEqual({ floor: 0 });
  });

  it("section이 양쪽 모두 비어 있으면(undefined) 변경으로 치지 않는다", () => {
    const emptySection: TableFormValues = { ...defaults, section: undefined };

    const result = tableDiffFromDefaults(
      {
        tableNumber: "1-1",
        seats: 4,
        floor: 1,
        section: undefined,
        isActive: true,
      },
      emptySection
    );

    expect(result).toEqual({});
  });

  it("isActive 토글을 감지한다", () => {
    const result = tableDiffFromDefaults(
      {
        tableNumber: "1-1",
        seats: 4,
        floor: 1,
        section: "메인 홀",
        isActive: false,
      },
      defaults
    );

    expect(result).toEqual({ isActive: false });
  });
});
