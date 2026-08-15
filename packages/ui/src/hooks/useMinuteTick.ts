import { useSyncExternalStore } from "react";

const TICK_MS = 60_000;

let tick = Date.now();
let interval: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

/**
 * 현재 시각은 React 바깥의 상태다. 구독자가 하나라도 있는 동안만 1분짜리 타이머를
 * 돌리고, 스토어 하나를 모두가 나눠 쓴다 — 남은 시간을 그리는 화면이 여러 개여도
 * 타이머는 하나다.
 */
function subscribe(onStoreChange: () => void) {
  if (interval === null) {
    // 구독이 끊긴 동안 tick이 멈춰 있었으므로 재개 시점에 다시 맞춘다.
    tick = Date.now();
    interval = setInterval(() => {
      tick = Date.now();
      listeners.forEach((notify) => notify());
    }, TICK_MS);
  }
  listeners.add(onStoreChange);

  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0 && interval !== null) {
      clearInterval(interval);
      interval = null;
    }
  };
}

const getSnapshot = () => tick;

/**
 * 서버에는 "지금"이 없다. 서버 렌더 시각으로 문자열을 만들면 하이드레이션 시점과
 * 분이 갈릴 때 텍스트가 어긋나므로, null을 돌려 호출부가 빈 자리를 그리게 한다.
 */
const getServerSnapshot = () => null;

/** 1분마다 갱신되는 현재 시각(ms). 서버 렌더에서는 `null`. */
export default function useMinuteTick() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
