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

export type CreateMenuParams = {
  storeId: string;
  createMenuPayload: CreateMenuPayload;
};
async function createMenu({ storeId, createMenuPayload }: CreateMenuParams) {
  const response = await http.post<Menu>(prefix(storeId), createMenuPayload);

  return response.data;
}

export type BulkCreateMenusParams = {
  storeId: string;
  bulkCreateMenusPayload: BulkCreateMenusPayload;
};

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
  storeId: string;
  menuId: string;
  updateMenuPayload: UpdateMenuPayload;
};
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
  storeId: string;
  reorderMenusPayload: ReorderMenusPayload;
};
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

export type DeleteMenuParams = {
  storeId: string;
  menuId: string;
};
async function deleteMenu({ storeId, menuId }: DeleteMenuParams) {
  await http.delete(`${prefix(storeId)}/${menuId}`);
}

export const httpMenus = {
  createMenu,
  bulkCreateMenus,
  updateMenu,
  reorderMenus,
  deleteMenu,
};
