import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  CreateCategoryPayload,
  createCategoryPayloadSchema,
} from "@ssurak/api/schemas/model/category.schema";
import { describe, expect, it, vi } from "vitest";
import useFormResolver from "../../../menus/hooks/useFormResolver";
import RenamingRow from "./RenamingRow";

/** CategoryReorderControl이 내려주는 것과 같은 중복 검사 resolver를 쓴다. */
function Harness({
  defaultName,
  existingNames = [],
  updateRename = () => {},
  closeRenamingRow = () => {},
}: {
  defaultName?: string;
  existingNames?: string[];
  updateRename?: (newName: string) => void;
  closeRenamingRow?: () => void;
}) {
  const resolver = useFormResolver<CreateCategoryPayload>({
    schema: createCategoryPayloadSchema,
    field: "name",
    existingValues: new Set(existingNames),
    duplicateMessage: "이미 존재하는 카테고리 이름입니다.",
  });

  return (
    <RenamingRow
      defaultName={defaultName}
      resolver={resolver}
      updateRename={updateRename}
      closeRenamingRow={closeRenamingRow}
    />
  );
}

const saveButton = () => screen.getByRole("button", { name: "저장" });

/**
 * 한글 IME 조합 중 상태를 만든다 (compositionend 없이 조합만 진행).
 * value는 반드시 네이티브 setter로 넣어야 한다. 직접 대입하면 React의 값 추적기가
 * "변경 없음"으로 판단해 onChange를 건너뛰고, 실제와 다른 결과가 나온다.
 */
function composeHangul(input: HTMLInputElement, text: string) {
  fireEvent.compositionStart(input);
  Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  )?.set?.call(input, text);
  fireEvent.compositionUpdate(input, { data: text });
  input.dispatchEvent(
    new InputEvent("input", { bubbles: true, data: text, isComposing: true })
  );
}

function textbox() {
  const input = screen.getByRole("textbox");
  if (!(input instanceof HTMLInputElement)) throw new Error("input이 아닙니다");
  return input;
}

describe("RenamingRow", () => {
  /**
   * Safari에서 조합이 열린 채 버튼을 누르면 mousedown이 삼켜져 click이 오지 않는다.
   * 그 복구는 SafariImeActivationRecovery가 전역에서 담당하므로 여기서는 다루지 않는다.
   */
  it("한글 조합 중에도 값이 반영되어 저장 버튼이 열린다", async () => {
    const updateRename = vi.fn();
    render(<Harness updateRename={updateRename} />);

    composeHangul(textbox(), "음료");

    await waitFor(() =>
      expect(saveButton().hasAttribute("disabled")).toBe(false)
    );

    fireEvent.click(saveButton());
    await waitFor(() => expect(updateRename).toHaveBeenCalledWith("음료"));
    expect(updateRename).toHaveBeenCalledTimes(1);
  });

  /** 조합 중 Enter는 IME 확정용이므로 제출로 가로채면 안 된다. */
  it("한글 조합 중 Enter는 제출하지 않는다", async () => {
    const updateRename = vi.fn();
    render(<Harness updateRename={updateRename} />);

    const input = textbox();
    composeHangul(input, "음료");
    await waitFor(() =>
      expect(saveButton().hasAttribute("disabled")).toBe(false)
    );

    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(updateRename).not.toHaveBeenCalled();

    // 조합이 끝난 뒤의 Enter는 제출한다.
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(updateRename).toHaveBeenCalledWith("음료"));
  });

  it("공백은 다듬어 넘긴다", async () => {
    const user = userEvent.setup();
    const updateRename = vi.fn();
    render(<Harness updateRename={updateRename} />);

    await user.type(screen.getByRole("textbox"), "  음료  ");
    await user.click(saveButton());

    expect(updateRename).toHaveBeenCalledWith("음료");
  });

  it("이미 있는 이름이면 제출하지 않고 사유를 보여준다", async () => {
    const user = userEvent.setup();
    const updateRename = vi.fn();
    render(<Harness existingNames={["음료"]} updateRename={updateRename} />);

    await user.type(screen.getByRole("textbox"), "음료");
    await user.click(saveButton());

    expect(
      await screen.findByText("이미 존재하는 카테고리 이름입니다.")
    ).toBeVisible();
    expect(updateRename).not.toHaveBeenCalled();
  });

  it("빈 이름이면 제출하지 않고 사유를 보여준다", async () => {
    const user = userEvent.setup();
    const updateRename = vi.fn();
    render(<Harness defaultName="디저트" updateRename={updateRename} />);

    await user.clear(screen.getByRole("textbox"));
    await user.click(saveButton());

    expect(
      await screen.findByText("카테고리 이름은 필수입니다.")
    ).toBeVisible();
    expect(updateRename).not.toHaveBeenCalled();
  });

  it("이름을 바꾸지 않았으면 제출 없이 닫는다", async () => {
    const user = userEvent.setup();
    const updateRename = vi.fn();
    const closeRenamingRow = vi.fn();
    render(
      <Harness
        defaultName="디저트"
        updateRename={updateRename}
        closeRenamingRow={closeRenamingRow}
      />
    );

    await user.click(saveButton());

    await waitFor(() => expect(closeRenamingRow).toHaveBeenCalled());
    expect(updateRename).not.toHaveBeenCalled();
  });
});
