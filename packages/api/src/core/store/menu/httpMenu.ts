import {
  CreateMenuPayload,
  ReorderMenusPayload,
  UpdateMenuPayload,
} from "../../../schemas/model/menu.schema";
import { BulkCreateMenusPayload } from "../../../schemas/model/menuDraft.schema";
import { Menu } from "../../../types/menu/menu.interface";
import { http } from "../../axios/http";

function prefix(storeId: string) {
  return `/stores/v1/${storeId}/menus`;
}

type StoreParams = { storeId: string };
export type MenuParams = StoreParams & { menuId: string };

export type CreateMenuParams = {
  createMenuPayload: CreateMenuPayload;
} & StoreParams;
async function createMenu({ storeId, createMenuPayload }: CreateMenuParams) {
  const response = await http.post<Menu>(prefix(storeId), createMenuPayload);

  return response.data;
}

export type BulkCreateMenusParams = {
  bulkCreateMenusPayload: BulkCreateMenusPayload;
} & StoreParams;

async function bulkCreateMenus({
  storeId,
  bulkCreateMenusPayload,
}: BulkCreateMenusParams) {
  const response = await http.post<Menu[]>(
    `${prefix(storeId)}/bulk`,
    bulkCreateMenusPayload
  );

  return response.data;
}

export type UpdateMenuParams = {
  updateMenuPayload: UpdateMenuPayload;
} & MenuParams;
async function updateMenu({
  storeId,
  menuId,
  updateMenuPayload,
}: UpdateMenuParams) {
  const response = await http.patch<Menu>(
    `${prefix(storeId)}/${menuId}`,
    updateMenuPayload
  );
  return response.data;
}

export type ReorderMenusParams = {
  reorderMenusPayload: ReorderMenusPayload;
} & StoreParams;
async function reorderMenus({
  storeId,
  reorderMenusPayload,
}: ReorderMenusParams) {
  const response = await http.put(
    `${prefix(storeId)}/reorder`,
    reorderMenusPayload
  );

  return response.data;
}

export function restoreMenu({ storeId, menuId }: MenuParams) {
  return http.patch(`${prefix(storeId)}/${menuId}/restore`);
}

async function deleteMenu({ storeId, menuId }: MenuParams) {
  await http.delete(`${prefix(storeId)}/${menuId}`);
}

export const httpMenus = {
  createMenu,
  bulkCreateMenus,
  updateMenu,
  reorderMenus,
  deleteMenu,
  restoreMenu,
};
