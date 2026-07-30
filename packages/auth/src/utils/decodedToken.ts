import { TokenPayloadDecoded } from "../types/token.interface";
import { jwtDecode } from "jwt-decode";

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
