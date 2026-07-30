import { COOKIE_TABLE } from "@ssurak/api/utils/cookieTable.const";
import { getServerCookie } from "./cookies";

export async function getAccessToken() {
  return (await getServerCookie(COOKIE_TABLE.ACCESS_TOKEN))?.value;
}
