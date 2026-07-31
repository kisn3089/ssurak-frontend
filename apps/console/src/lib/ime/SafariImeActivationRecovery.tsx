"use client";

import useSafariImeActivationRecovery from "./useSafariImeActivationRecovery";

/**
 * Safari가 IME 조합 확정에 소비해버린 mousedown을 되살리는 폴리필.
 * 동작 근거와 한계는 {@link useSafariImeActivationRecovery} 주석에 있다.
 *
 * 렌더링하지 않고 document 리스너만 단다. 버튼마다 붙이면 새 버튼을 추가할 때
 * 빠뜨려 재발하므로 루트에 한 번만 둔다.
 */
export default function SafariImeActivationRecovery() {
  useSafariImeActivationRecovery();

  return null;
}
