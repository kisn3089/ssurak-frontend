/**
 * 날짜를 ko-KR / Asia/Seoul 기준 문자열로 포맷한다.
 *
 * `"use client"` 컴포넌트도 서버에서 프리렌더되므로 이 함수는 SSR 경로에서도
 * 실행된다. 서버와 브라우저가 같은 문자열을 만들어야 hydration이 어긋나지 않으므로
 * 두 가지를 지킨다.
 *
 * 1. locale과 timeZone을 런타임 환경이 아니라 상수로 고정한다. `navigator.language`나
 *    호스트 TZ에 의존하면 서버(TZ 미지정 컨테이너 = UTC)와 단말이 갈린다.
 * 2. **호출부는 고정된 타임스탬프를 넘겨야 한다.** `Date.now()`처럼 렌더 시점마다
 *    달라지는 값을 넣으면 상수 고정과 무관하게 서버·클라이언트 출력이 어긋난다.
 *    경과 시간처럼 흐르는 값이 필요하면 마운트 이후 계산하는 별도 컴포넌트를 쓴다.
 *
 * @param options 지정하면 기본 필드(시:분)를 대체한다. timeZone은 항상 적용된다.
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
  overrideLocale?: string
): string {
  const locale: Intl.LocalesArgument = overrideLocale ?? "ko-KR";

  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };

  return new Date(date).toLocaleString(locale, {
    timeZone: "Asia/Seoul",
    ...(options ?? defaultOptions),
  });
}

export function formatRemaining(expiresAt: string, now: number = Date.now()) {
  const remainingMs = new Date(expiresAt).getTime() - now;
  if (remainingMs <= 0) return "곧 ";

  const hours = Math.floor(remainingMs / 3_600_000);
  if (hours >= 1)
    return `${hours}시간 ${Math.floor((remainingMs % 3_600_000) / 60_000)}분 후 `;

  return `${Math.max(1, Math.floor(remainingMs / 60_000))}분 후 `;
}

/** 만료까지 남은 시간을 **고정 유효기간(`totalMs`)** 대비 0~100으로 환산한다. */
export function remainingRatio(
  expiresAt: string,
  totalMs: number,
  now: number
): number {
  if (!Number.isFinite(totalMs) || totalMs <= 0) return 0;

  const remainingMs = new Date(expiresAt).getTime() - now;
  const ratio = (remainingMs / totalMs) * 100;

  return Math.min(100, Math.max(0, ratio));
}
