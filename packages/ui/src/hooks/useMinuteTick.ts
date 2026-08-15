import { useSyncExternalStore } from "react";

const TICK_MS = 60_000;

let tick = Date.now();
let interval: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

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

const getServerSnapshot = () => null;

export default function useMinuteTick() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
