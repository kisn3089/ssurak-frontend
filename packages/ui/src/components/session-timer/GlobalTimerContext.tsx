"use client";

import { createContext, useContext, useEffect, useState } from "react";

const GlobalTimerContext = createContext<number>(Date.now());

export function GlobalTimerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // 초기값 계산은 지연시킨다. 렌더마다 Date.now()를 부르면 결과가 불안정한 순수하지 않은 렌더가 된다.
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    // 전역 타이머 1개만 생성
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // 1분마다

    return () => clearInterval(interval);
  }, []);

  return (
    <GlobalTimerContext.Provider value={currentTime}>
      {children}
    </GlobalTimerContext.Provider>
  );
}

export function useGlobalTimer() {
  return useContext(GlobalTimerContext);
}
