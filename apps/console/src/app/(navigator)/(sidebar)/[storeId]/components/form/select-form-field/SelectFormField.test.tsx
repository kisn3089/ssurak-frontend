import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import ReorderForm, { ReorderRowData } from "../reorder-form-field/ReorderForm";
import SelectFormField from "./SelectFormField";

/** jsdom에는 포인터 캡처가 없다. (OptionFormField.test.tsx와 같은 이유) */
beforeAll(() => {
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
});

afterEach(() => vi.restoreAllMocks());

const ROW_HEIGHT = 56;

type CategoryForm = { categoryId: string };

const CATEGORY_ROWS: ReorderRowData[] = [
  { id: "coffee", name: "커피" },
  { id: "dessert", name: "디저트" },
  { id: "drink", name: "음료" },
];

/**
 * "관리" 버튼은 children 이 있을 때만 나온다. (ChangeFormControl 의 hasChildren)
 * 앱에서는 CategoryFormController 가 그 자리에 카테고리 정렬 목록을 넣는데,
 * 그쪽은 서버 데이터와 mutation 에 묶여 있으니 정렬 목록만 같은 모양으로 세운다.
 */
function Harness() {
  const { control } = useForm<CategoryForm>({
    defaultValues: { categoryId: "" },
  });
  const [rows, setRows] = useState(CATEGORY_ROWS);

  return (
    <SelectFormField<CategoryForm>
      id="categoryId"
      label="카테고리"
      type="select"
      control={control}
      options={rows.map((row) => ({ value: row.id, label: row.name }))}
    >
      {() => (
        <ReorderForm
          reorderRow={rows}
          onReorder={(reorderedIds) =>
            setRows((previous) =>
              reorderedIds.flatMap((id) =>
                previous.filter((row) => row.id === id)
              )
            )
          }
        />
      )}
    </SelectFormField>
  );
}

function getRows() {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-drag-item]"));
}

function getRowNames() {
  return getRows().map((row) => row.querySelector("span")?.textContent);
}

/**
 * jsdom은 레이아웃을 계산하지 않아 getBoundingClientRect가 전부 0이다.
 * 행이 재정렬되어도 따라가도록, 호출 시점의 형제 순서로 위치를 만들어 준다.
 */
function stubRowRects() {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function (this: HTMLElement) {
      const index = getRows().indexOf(this);
      const top = index < 0 ? 0 : index * ROW_HEIGHT;
      const height = index < 0 ? 0 : ROW_HEIGHT;

      return { top, height, bottom: top + height } as DOMRect;
    }
  );
}

/** 그립을 잡고 clientY 까지 끌어다 놓는다. */
function dragHandle(categoryName: string, toClientY: number) {
  const handle = screen.getByRole("button", {
    name: `${categoryName} 순서 변경`,
  });
  const fromClientY =
    getRows().findIndex((row) => row.contains(handle)) * ROW_HEIGHT +
    ROW_HEIGHT / 2;

  fireEvent.pointerDown(handle, {
    button: 0,
    pointerId: 1,
    clientY: fromClientY,
  });
  fireEvent.pointerMove(handle, { pointerId: 1, clientY: toClientY });
  fireEvent.pointerUp(handle, { pointerId: 1, clientY: toClientY });
}

describe("SelectFormField 카테고리 정렬", () => {
  async function openManageMode() {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "관리" }));
    stubRowRects();
    return user;
  }

  it("그립을 아래로 끌면 해당 카테고리가 그 위치로 이동한다", async () => {
    await openManageMode();
    expect(getRowNames()).toEqual(["커피", "디저트", "음료"]);

    // 두 번째 행(56~112)의 중간을 넘긴 지점
    dragHandle("커피", 90);

    expect(getRowNames()).toEqual(["디저트", "커피", "음료"]);
  });

  it("행 높이의 절반에 못 미치게 끌어도 한 칸 이동이 확정된다", async () => {
    await openManageMode();

    // 첫 행 중앙(28)에서 20px 만 내린 지점. 두 번째 행 중앙선(84)에는 한참 못 미친다.
    dragHandle("커피", ROW_HEIGHT / 2 + 20);

    expect(getRowNames()).toEqual(["디저트", "커피", "음료"]);
  });

  it("위로 끌 때도 같은 거리에서 확정된다", async () => {
    await openManageMode();

    // 세 번째 행 중앙(140)에서 20px 만 올린 지점
    dragHandle("음료", ROW_HEIGHT * 2 + ROW_HEIGHT / 2 - 20);

    expect(getRowNames()).toEqual(["커피", "음료", "디저트"]);
  });

  it("직전 드래그 직후에도 다음 드래그가 씹히지 않는다", async () => {
    await openManageMode();

    dragHandle("커피", 90);
    expect(getRowNames()).toEqual(["디저트", "커피", "음료"]);

    dragHandle("음료", 10);
    expect(getRowNames()).toEqual(["음료", "디저트", "커피"]);
  });

  it("문턱 미만으로 움직이면 순서를 바꾸지 않는다", async () => {
    await openManageMode();

    dragHandle("커피", ROW_HEIGHT / 2 + 2);

    expect(getRowNames()).toEqual(["커피", "디저트", "음료"]);
  });

  it("그립에서 방향키로도 순서를 바꾼다", async () => {
    const user = await openManageMode();

    await user.click(screen.getByRole("button", { name: "커피 순서 변경" }));
    await user.keyboard("{ArrowDown}");

    expect(getRowNames()).toEqual(["디저트", "커피", "음료"]);
  });
});
