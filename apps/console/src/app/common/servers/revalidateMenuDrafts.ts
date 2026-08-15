"use server";

import { updateTag } from "next/cache";
import { menuDraftsTag } from "./menuDraftsCache";

export async function revalidateMenuDrafts(storeId: string) {
  updateTag(menuDraftsTag(storeId));
}
