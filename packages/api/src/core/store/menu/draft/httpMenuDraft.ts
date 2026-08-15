import { UpdateMenuDraftPayload } from "../../../../schemas/model/menuDraft.schema";
import { MenuDraftResponse } from "../../../../types/menuDraft/menuDraft.interface";
import { http } from "../../../axios/http";

function prefix(storeId: string) {
  return `/stores/v1/${storeId}/menus/drafts`;
}

const FILE_FIELD_NAME = "file";

export type CreateMenuDraftParams = {
  storeId: string;
  files: File[];
};

async function createDraft({ storeId, files }: CreateMenuDraftParams) {
  const formData = new FormData();
  files.forEach((file) => formData.append(FILE_FIELD_NAME, file));

  const response = await http.post<MenuDraftResponse>(
    prefix(storeId),
    formData,
    // 비전 모델 추출은 수십 초가 걸린다. axios 기본 타임아웃으로는 어림도 없다.
    { timeout: 120_000 }
  );
  return response.data;
}

export type UpdateMenuDraftParams = {
  storeId: string;
  draftId: string;
  updateMenuDraftPayload: UpdateMenuDraftPayload;
};

async function updateDraft({
  storeId,
  draftId,
  updateMenuDraftPayload,
}: UpdateMenuDraftParams) {
  const response = await http.patch<MenuDraftResponse>(
    `${prefix(storeId)}/${draftId}`,
    updateMenuDraftPayload
  );
  return response.data;
}

export const httpMenuDrafts = {
  createDraft,
  updateDraft,
};
