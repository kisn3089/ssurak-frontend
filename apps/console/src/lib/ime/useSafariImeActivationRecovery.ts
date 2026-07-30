import { useEffect } from "react";

/**
 * 조합 확정(compositionend)과 mouseup 사이의 최대 간격.
 * 마우스를 눌러 조합이 확정된 뒤 손을 떼기까지의 시간이라 실측은 100ms 안팎이었다.
 * 넉넉히 잡되, 무관한 mouseup까지 끌어들이지 않을 만큼은 짧게 둔다.
 */
const COMMIT_TO_MOUSEUP_WINDOW_MS = 1000;

/** mousedown의 기본 동작이 포커스를 옮겼을 대상들. */
const FOCUSABLE_SELECTOR = [
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  "button:not([disabled])",
  "a[href]",
  '[contenteditable=""]',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Safari에서 한글 IME 조합이 열린 채로 마우스를 누르면, 브라우저가 그 mousedown을
 * 조합 확정에 소비하고 DOM으로 전달하지 않는다. mousedown이 없으면 브라우저는
 * 그 기본 동작(포커스 이동)도, 뒤따를 click도 만들지 않는다.
 * 그래서 "한글 입력 직후 첫 클릭이 씹히고 두 번째에 동작"하는 증상이 된다.
 */
export default function useSafariImeActivationRecovery() {
  useEffect(() => {
    // WebKit 전용 증상이다. iOS의 Chrome·Firefox도 WebKit 기반이라 같은 벤더로
    // 잡히는데, 같은 버그를 겪으므로 포함되는 게 맞다.
    if (navigator.vendor !== "Apple Computer, Inc.") return;

    /** 마지막 조합 확정 시각. null이면 "복구할 것 없음". */
    let committedAt: number | null = null;
    /** 이번 누름의 mousedown이 DOM까지 도달했는지. 도달했으면 복구할 게 없다. */
    let didReceiveMouseDown = false;

    const markComposingCommitted = () => {
      committedAt = Date.now();
    };

    /**
     * mousedown이 왔다는 건 브라우저가 삼키지 않았다는 뜻이다. 이 사실은
     * 뒤늦게 도착하는 compositionend보다 우선한다 — committedAt만 비우면
     * 그 compositionend가 다시 무장시켜, 브라우저의 진짜 click 위에 합성
     * click이 겹치고 제출이 두 번 일어난다.
     */
    const markMouseDownReceived = () => {
      didReceiveMouseDown = true;
      committedAt = null;
    };

    const forgetCommit = () => {
      committedAt = null;
    };

    const recoverActivation = (event: MouseEvent) => {
      const shouldRecover =
        !didReceiveMouseDown &&
        committedAt !== null &&
        Date.now() - committedAt <= COMMIT_TO_MOUSEUP_WINDOW_MS &&
        event.button === 0;

      // 다음 누름으로 상태가 새지 않도록 판정 직후 초기화한다.
      didReceiveMouseDown = false;
      committedAt = null;

      if (!shouldRecover) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      // 1. mousedown이 했어야 할 포커스 이동. click으로는 포커스가 옮겨지지 않는다.
      const focusTarget = target.closest(FOCUSABLE_SELECTOR);
      if (focusTarget instanceof HTMLElement) focusTarget.focus();

      // 2. 브라우저가 합성하지 않은 click. dispatch 과정에서 activation behavior가
      //    그대로 돌기 때문에 폼 제출·링크 이동·체크박스 토글까지 함께 복구된다.
      target.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          composed: true,
          view: event.view,
          detail: 1,
          button: event.button,
          clientX: event.clientX,
          clientY: event.clientY,
          screenX: event.screenX,
          screenY: event.screenY,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          altKey: event.altKey,
          metaKey: event.metaKey,
        })
      );
    };

    document.addEventListener("compositionend", markComposingCommitted, true);
    document.addEventListener("mousedown", markMouseDownReceived, true);
    document.addEventListener("click", forgetCommit, true);
    // mouseup은 버블 단계로 듣는다. React 핸들러보다 뒤에 실행돼야 실제 브라우저와
    // 같은 mouseup → click 순서가 된다. 놓치면 복구가 안 될 뿐 오작동은 없다.
    document.addEventListener("mouseup", recoverActivation);

    return () => {
      document.removeEventListener(
        "compositionend",
        markComposingCommitted,
        true
      );
      document.removeEventListener("mousedown", markMouseDownReceived, true);
      document.removeEventListener("click", forgetCommit, true);
      document.removeEventListener("mouseup", recoverActivation);
    };
  }, []);
}
