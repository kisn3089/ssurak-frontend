"use client";

import { useEffect, useState } from "react";

const STEP_ELAPSED_MS = [0, 2_500, 12_000];

type Progress = { submittedAt: number; step: number };

/**
 * @param isExtracting 추출 요청이 진행 중인지
 * @param submittedAt 요청이 시작된 시각. mutation마다 달라져 이전 실행의 단계가 새 실행에
 *   섞이지 않게 하는 식별자로 쓴다.
 */
export default function useExtractionStep(
  isExtracting: boolean,
  submittedAt: number
) {
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    if (!isExtracting) return;

    const timers = STEP_ELAPSED_MS.map((delay, step) =>
      setTimeout(() => setProgress({ submittedAt, step }), delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [isExtracting, submittedAt]);

  // 이번 실행의 단계만 인정한다. 끝났거나 직전 실행의 값이면 안내를 감춘다.
  if (!isExtracting || progress?.submittedAt !== submittedAt) return null;

  return progress.step;
}
