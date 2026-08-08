import * as React from "react";

const MOBILE_BREAKPOINT = 768;

const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

/**
 * 미디어 쿼리는 React 바깥의 상태다. useState + useEffect로 옮겨 담으면 마운트 직후
 * 현재 값을 맞추느라 렌더가 한 번 더 도므로, 스냅샷을 그대로 읽는다.
 */
const subscribe = (onStoreChange: () => void) => {
  const mediaQueryList = window.matchMedia(MOBILE_MEDIA_QUERY);
  mediaQueryList.addEventListener("change", onStoreChange);
  return () => mediaQueryList.removeEventListener("change", onStoreChange);
};

const getSnapshot = () => window.matchMedia(MOBILE_MEDIA_QUERY).matches;

/** 서버에는 뷰포트가 없으므로 데스크톱으로 가정한다. */
const getServerSnapshot = () => false;

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
