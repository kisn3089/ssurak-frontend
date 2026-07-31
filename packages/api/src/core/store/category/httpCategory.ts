import {
  CreateCategoryPayload,
  ReorderCategoriesPayload,
  UpdateCategoryPayload,
} from "../../../schemas/model/category.schema";
import { http } from "../../axios/http";

function prefix(storeId: string) {
  return `/stores/v1/${storeId}/categories`;
}

export type CreateCategoryParams = {
  storeId: string;
  createCategoryPayload: CreateCategoryPayload;
};
async function createCategory({
  storeId,
  createCategoryPayload,
}: CreateCategoryParams) {
  const response = await http.post(prefix(storeId), createCategoryPayload);

  return response.data;
}

export type UpdateCategoryParams = {
  storeId: string;
  categoryId: string;
  updateCategoryPayload: UpdateCategoryPayload;
};
async function updateCategory(params: UpdateCategoryParams) {
  const { storeId, categoryId, updateCategoryPayload } = params;
  const response = await http.patch(
    `${prefix(storeId)}/${categoryId}`,
    updateCategoryPayload
  );

  return response.data;
}

export type ReorderCategoryParams = {
  storeId: string;
  reorderCategoriesPayload: ReorderCategoriesPayload;
};
async function reorderCategories({
  storeId,
  reorderCategoriesPayload,
}: ReorderCategoryParams) {
  const response = await http.put(
    `${prefix(storeId)}/reorder`,
    reorderCategoriesPayload
  );

  return response.data;
}

export type DeleteCategoryParams = {
  storeId: string;
  categoryId: string;
};
async function deleteCategory({ storeId, categoryId }: DeleteCategoryParams) {
  await http.delete(`${prefix(storeId)}/${categoryId}`);
}

export const httpCategories = {
  createCategory,
  updateCategory,
  reorderCategories,
  deleteCategory,
};
