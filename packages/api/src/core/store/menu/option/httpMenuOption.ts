import {
  CreateMenuOptionPayload,
  CreateOptionChoicePayload,
  ReorderMenuOptionsPayload,
  ReorderOptionChoicesPayload,
  UpdateMenuOptionPayload,
  UpdateOptionChoicePayload,
} from "../../../../schemas/model/menuOption.schema";
import {
  MenuOptionChoice,
  MenuOptionGroup,
} from "../../../../types/menu/menuOptions.interface";
import { http } from "../../../axios/http";

/**
 * 메뉴 옵션·선택지 API.
 *
 * 옵션은 메뉴 페이로드에 실리지 않는다 — 생성만 부모 아래에 중첩하고
 * 개별 리소스는 publicId로 직접 주소를 매긴다. 조회를 따로 두는 이유도 같다:
 * 옵션만 바뀌었을 때 메뉴 캐시까지 무효화하지 않기 위해서다.
 */

export function menuOptionsUrl(storeId: string, menuId: string) {
  return `/stores/v1/${storeId}/menus/${menuId}/options`;
}

export function optionUrl(storeId: string, optionId: string) {
  return `/stores/v1/${storeId}/options/${optionId}`;
}

export function optionChoicesUrl(storeId: string, optionId: string) {
  return `${optionUrl(storeId, optionId)}/choices`;
}

export function choiceUrl(storeId: string, choiceId: string) {
  return `/stores/v1/${storeId}/choices/${choiceId}`;
}

export type FetchMenuOptionsParams = {
  storeId: string;
  menuId: string;
};
async function fetchMenuOptions({ storeId, menuId }: FetchMenuOptionsParams) {
  const response = await http.get<MenuOptionGroup[]>(
    menuOptionsUrl(storeId, menuId)
  );

  return response.data;
}

export type FetchMenuOptionParams = {
  storeId: string;
  optionId: string;
};
async function fetchMenuOption({ storeId, optionId }: FetchMenuOptionParams) {
  const response = await http.get<MenuOptionGroup>(
    optionUrl(storeId, optionId)
  );

  return response.data;
}

export type CreateMenuOptionParams = {
  storeId: string;
  menuId: string;
  createMenuOptionPayload: CreateMenuOptionPayload;
};
async function createMenuOption({
  storeId,
  menuId,
  createMenuOptionPayload,
}: CreateMenuOptionParams) {
  const response = await http.post<MenuOptionGroup>(
    menuOptionsUrl(storeId, menuId),
    createMenuOptionPayload
  );

  return response.data;
}

export type UpdateMenuOptionParams = {
  storeId: string;
  optionId: string;
  updateMenuOptionPayload: UpdateMenuOptionPayload;
};
async function updateMenuOption({
  storeId,
  optionId,
  updateMenuOptionPayload,
}: UpdateMenuOptionParams) {
  const response = await http.patch<MenuOptionGroup>(
    optionUrl(storeId, optionId),
    updateMenuOptionPayload
  );

  return response.data;
}

export type DeleteMenuOptionParams = {
  storeId: string;
  optionId: string;
};
async function deleteMenuOption({ storeId, optionId }: DeleteMenuOptionParams) {
  await http.delete(optionUrl(storeId, optionId));
}

export type ReorderMenuOptionsParams = {
  storeId: string;
  menuId: string;
  reorderMenuOptionsPayload: ReorderMenuOptionsPayload;
};
async function reorderMenuOptions({
  storeId,
  menuId,
  reorderMenuOptionsPayload,
}: ReorderMenuOptionsParams) {
  const response = await http.put<MenuOptionGroup[]>(
    `${menuOptionsUrl(storeId, menuId)}/reorder`,
    reorderMenuOptionsPayload
  );

  return response.data;
}

export type FetchOptionChoicesParams = {
  storeId: string;
  optionId: string;
};
async function fetchOptionChoices({
  storeId,
  optionId,
}: FetchOptionChoicesParams) {
  const response = await http.get<MenuOptionChoice[]>(
    optionChoicesUrl(storeId, optionId)
  );

  return response.data;
}

export type FetchOptionChoiceParams = {
  storeId: string;
  choiceId: string;
};
async function fetchOptionChoice({
  storeId,
  choiceId,
}: FetchOptionChoiceParams) {
  const response = await http.get<MenuOptionChoice>(
    choiceUrl(storeId, choiceId)
  );

  return response.data;
}

export type CreateOptionChoiceParams = {
  storeId: string;
  optionId: string;
  createOptionChoicePayload: CreateOptionChoicePayload;
};
async function createOptionChoice({
  storeId,
  optionId,
  createOptionChoicePayload,
}: CreateOptionChoiceParams) {
  const response = await http.post<MenuOptionChoice>(
    optionChoicesUrl(storeId, optionId),
    createOptionChoicePayload
  );

  return response.data;
}

export type UpdateOptionChoiceParams = {
  storeId: string;
  choiceId: string;
  updateOptionChoicePayload: UpdateOptionChoicePayload;
};
async function updateOptionChoice({
  storeId,
  choiceId,
  updateOptionChoicePayload,
}: UpdateOptionChoiceParams) {
  const response = await http.patch<MenuOptionChoice>(
    choiceUrl(storeId, choiceId),
    updateOptionChoicePayload
  );

  return response.data;
}

export type DeleteOptionChoiceParams = {
  storeId: string;
  choiceId: string;
};
async function deleteOptionChoice({
  storeId,
  choiceId,
}: DeleteOptionChoiceParams) {
  await http.delete(choiceUrl(storeId, choiceId));
}

export type ReorderOptionChoicesParams = {
  storeId: string;
  optionId: string;
  reorderOptionChoicesPayload: ReorderOptionChoicesPayload;
};
async function reorderOptionChoices({
  storeId,
  optionId,
  reorderOptionChoicesPayload,
}: ReorderOptionChoicesParams) {
  const response = await http.put<MenuOptionChoice[]>(
    `${optionChoicesUrl(storeId, optionId)}/reorder`,
    reorderOptionChoicesPayload
  );

  return response.data;
}

export const httpMenuOptions = {
  fetchMenuOptions,
  fetchMenuOption,
  createMenuOption,
  updateMenuOption,
  deleteMenuOption,
  reorderMenuOptions,
  fetchOptionChoices,
  fetchOptionChoice,
  createOptionChoice,
  updateOptionChoice,
  deleteOptionChoice,
  reorderOptionChoices,
};
