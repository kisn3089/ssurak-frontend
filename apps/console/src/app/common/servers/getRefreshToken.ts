"use server";

import { COOKIE_TABLE } from "@ssurak/api/utils/cookieTable.const";
import { getServerCookie } from "./cookies";

export async function getRefreshToken() {
  return (await getServerCookie(COOKIE_TABLE.REFRESH))?.value;
}
