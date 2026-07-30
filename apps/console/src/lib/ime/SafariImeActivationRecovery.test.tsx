import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SafariImeActivationRecovery from "./SafariImeActivationRecovery";

/**
 * Safari가 IME 조합 확정에 mousedown을 소비했을 때의 이벤트 흐름을 재현한다.
 * 핵심은 "무엇이 없는가"다. pointerdown·mousedown·click 없이 mouseup만 도착한다.
 */
function commitCompositionByMouseUp(
  composing: HTMLElement,
  pressed: HTMLElement
) {
  fireEvent.compositionEnd(composing, { data: "음료" });
  fireEvent.mouseUp(pressed, { button: 0 });
}

function renderFixture({
  onSubmit = vi.fn(),
  onButtonClick = vi.fn(),
}: {
  onSubmit?: () => void;
  onButtonClick?: () => void;
} = {}) {
  render(
    <>
      <SafariImeActivationRecovery />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <input aria-label="메뉴 이름" />
        <input aria-label="메뉴 설명" />
        <button type="button" onClick={onButtonClick}>
          옵션 추가
        </button>
        <button type="submit">저장</button>
      </form>
    </>
  );

  return {
    onSubmit,
    onButtonClick,
    name: screen.getByLabelText("메뉴 이름"),
    description: screen.getByLabelText("메뉴 설명"),
    addOption: screen.getByRole("button", { name: "옵션 추가" }),
    save: screen.getByRole("button", { name: "저장" }),
  };
}

describe("SafariImeActivationRecovery", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("조합 확정에 mousedown이 삼켜져도 버튼이 눌린다", () => {
    const { name, addOption, onButtonClick } = renderFixture();

    commitCompositionByMouseUp(name, addOption);

    expect(onButtonClick).toHaveBeenCalledTimes(1);
  });

  it("조합 확정에 mousedown이 삼켜져도 다른 입력창으로 포커스가 옮겨간다", () => {
    const { name, description } = renderFixture();
    name.focus();

    commitCompositionByMouseUp(name, description);

    expect(document.activeElement).toBe(description);
  });

  it("버튼 안쪽 요소를 눌러도 버튼이 포커스를 받는다", () => {
    render(
      <>
        <SafariImeActivationRecovery />
        <input aria-label="메뉴 이름" />
        <button type="button">
          <span>옵션 추가</span>
        </button>
      </>
    );
    const label = screen.getByText("옵션 추가");

    commitCompositionByMouseUp(screen.getByLabelText("메뉴 이름"), label);

    expect(document.activeElement).toBe(label.closest("button"));
  });

  /** click이 없으면 브라우저는 폼도 제출하지 않는다. 합성 click의 activation behavior가 이를 되살린다. */
  it("제출 버튼이면 폼 제출까지 복구된다", () => {
    const { name, save, onSubmit } = renderFixture();

    commitCompositionByMouseUp(name, save);

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("평범한 클릭은 건드리지 않는다", () => {
    const { name, addOption, onButtonClick } = renderFixture();

    fireEvent.compositionEnd(name, { data: "음료" });
    fireEvent.mouseDown(addOption, { button: 0 });
    fireEvent.mouseUp(addOption, { button: 0 });
    fireEvent.click(addOption, { button: 0 });

    expect(onButtonClick).toHaveBeenCalledTimes(1);
  });

  it("조합이 없었으면 mouseup만으로는 아무 일도 하지 않는다", () => {
    const { addOption, onButtonClick } = renderFixture();

    // 창 밖에서 누르고 안에서 떼는 경우처럼 mousedown 없는 mouseup은 정상적으로도 생긴다.
    fireEvent.mouseUp(addOption, { button: 0 });

    expect(onButtonClick).not.toHaveBeenCalled();
  });

  it("조합 확정 후 한참 지난 mouseup은 복구하지 않는다", () => {
    vi.useFakeTimers();
    const { name, addOption, onButtonClick } = renderFixture();

    fireEvent.compositionEnd(name, { data: "음료" });
    vi.advanceTimersByTime(1500);
    fireEvent.mouseUp(addOption, { button: 0 });

    expect(onButtonClick).not.toHaveBeenCalled();
  });

  it("주 버튼이 아닌 클릭은 복구하지 않는다", () => {
    const { name, addOption, onButtonClick } = renderFixture();

    fireEvent.compositionEnd(name, { data: "음료" });
    fireEvent.mouseUp(addOption, { button: 2 });

    expect(onButtonClick).not.toHaveBeenCalled();
  });

  it("한 번 복구한 뒤 곧바로 온 mouseup은 다시 복구하지 않는다", () => {
    const { name, addOption, onButtonClick } = renderFixture();

    commitCompositionByMouseUp(name, addOption);
    fireEvent.mouseUp(addOption, { button: 0 });

    expect(onButtonClick).toHaveBeenCalledTimes(1);
  });

  it("언마운트하면 리스너를 걷어낸다", () => {
    const onButtonClick = vi.fn();
    const { unmount } = render(<SafariImeActivationRecovery />);
    render(
      <>
        <input aria-label="메뉴 이름" />
        <button type="button" onClick={onButtonClick}>
          옵션 추가
        </button>
      </>
    );
    unmount();

    commitCompositionByMouseUp(
      screen.getByLabelText("메뉴 이름"),
      screen.getByRole("button", { name: "옵션 추가" })
    );

    expect(onButtonClick).not.toHaveBeenCalled();
  });
});
