import { TokenPayload, TokenPayloadDecoded } from "../types/token.interface";
import { jwtDecode } from "jwt-decode";

/**
 * 토큰 주체(계정 식별자)를 꺼낸다. 서버 캐시 키처럼 사용자별로 갈라야 하는 곳에 쓴다.
 * 서명을 검증하지 않으므로 **인가 판단에 쓰면 안 된다** — 권한은 백엔드가 정한다.
 */
export function getTokenSubject(token: string | undefined): string | null {
  if (!token) return null;

  try {
    return jwtDecode<TokenPayload & TokenPayloadDecoded>(token).sub;
  } catch (error) {
    console.error("[getTokenSubject] Failed to decode token", error);
    return null;
  }
}

export function isExpired(token: string | undefined): boolean {
  if (!token) return true;

  try {
    const decodedToken = jwtDecode<TokenPayloadDecoded>(token);
    if (Date.now() >= decodedToken.exp * 1000) {
      return true;
    }
  } catch (error) {
    console.error("[isExpired] Failed to decode token", error);
    return true;
  }

  return false;
}
