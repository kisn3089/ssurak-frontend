"use server";

import { COOKIE_TABLE } from "@ssurak/api/utils/cookieTable.const";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { cookieOptions } from "../../../../utils/cookieOptions";

type CookieKey = (typeof COOKIE_TABLE)[keyof typeof COOKIE_TABLE];

export async function getServerCookie(name: CookieKey) {
  const cookieStore = await cookies();
  return cookieStore.get(name);
}

export async function setServerCookie(
  name: CookieKey,
  value: string,
  options?: Pick<ResponseCookie, "path" | "maxAge" | "expires">
) {
  const cookieStore = await cookies();
  cookieStore.set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    ...cookieOptions,
    ...options,
    path: options?.path ?? cookieOptions.path,
  });
}

export async function clearServerCookie(names: CookieKey[]) {
  const cookieStore = await cookies();
  for (const name of names) {
    cookieStore.delete({ name, ...cookieOptions });
  }
}
