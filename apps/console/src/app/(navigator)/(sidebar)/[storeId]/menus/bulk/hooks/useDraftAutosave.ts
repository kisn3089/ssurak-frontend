"use client";

import { updateMenuDraftPayloadSchema } from "@ssurak/api/schemas/model/menuDraft.schema";
import useMenuDraftMutation from "@ssurak/api/core/store/menu/draft/useMenuDraftMutation";
import { useEffect, useRef } from "react";
import {
  DraftItemFormValue,
  toUpdatePayloadItems,
} from "../utils/draft-review";

import { useActionStatus } from "@ssurak/ui/components/action-status/ActionStatusContext";
import useDebounce from "@ssurak/ui/hooks/useDebounce";
import useDesireActionStateEffect from "@ssurak/ui/components/action-status/useDesireActionStateEffect";
import useLocalStorage from "@ssurak/ui/hooks/useLocalStorage";
import { getRawLocalStorageItem } from "@ssurak/ui/utils/local-storage";
import { revalidateMenuDrafts } from "@/app/common/servers/revalidateMenuDrafts";
import { DEFAULT_FORM_VALUES } from "../components/BulkCreateMenuForm";

const AUTOSAVE_DELAY_MS = 1_000;

export function localDraftKey(storeId: string) {
  return `ssurak.menu-draft.${storeId}`;
}

/** 저장한 뒤 스키마가 바뀌었을 수 있으므로 읽는 시점에 다시 검증한다. */
function parseLocalDraft(raw: unknown) {
  return updateMenuDraftPayloadSchema.safeParse(raw).data ?? null;
}

function serializePayload(items: DraftItemFormValue[]) {
  const parsed = updateMenuDraftPayloadSchema.safeParse({
    items: toUpdatePayloadItems(items),
  });
  if (!parsed.success) return null;

  return { data: parsed.data, serialized: JSON.stringify(parsed.data) };
}

type UseDraftAutosaveParams = {
  storeId: string;
  draftId?: string;
  items: DraftItemFormValue[];
};

export default function useDraftAutosave({
  storeId,
  draftId,
  items,
}: UseDraftAutosaveParams) {
  const { updateDraft } = useMenuDraftMutation(storeId);
  const { mutateAsync } = updateDraft;

  const [localDraft, setLocalDraft, clearLocalDraft] = useLocalStorage(
    localDraftKey(storeId),
    { fallback: DEFAULT_FORM_VALUES, parse: parseLocalDraft }
  );

  const lastSavedRef = useRef<string | null>(null);
  const hasRevalidatedRef = useRef(false);
  const { setActionStatus } = useActionStatus();

  useDesireActionStateEffect({
    state: "idle",
    when: "unmounted",
  });

  const hasBaselineRef = useRef(false);

  useEffect(() => {
    if (hasBaselineRef.current || items.length === 0) return;

    hasBaselineRef.current = true;
    lastSavedRef.current = serializePayload(items)?.serialized ?? null;
  }, [items]);

  useDebounce(
    async () => {
      const payload = serializePayload(items);
      if (!payload) return;
      if (lastSavedRef.current === payload.serialized) return;

      if (!draftId) {
        if (
          getRawLocalStorageItem(localDraftKey(storeId)) === payload.serialized
        ) {
          lastSavedRef.current = payload.serialized;
          return;
        }

        const isSaved =
          payload.data.items.length === 0
            ? clearLocalDraft()
            : setLocalDraft(payload.data);

        if (isSaved) lastSavedRef.current = payload.serialized;
        setActionStatus(isSaved ? "success" : "error");
        return;
      }

      setActionStatus("loading");
      try {
        await mutateAsync({ draftId, updateMenuDraftPayload: payload.data });
        lastSavedRef.current = payload.serialized;
        setActionStatus("success");

        if (!hasRevalidatedRef.current) {
          hasRevalidatedRef.current = true;
          revalidateMenuDrafts(storeId);
        }
      } catch {
        setActionStatus("error");
      }
    },
    AUTOSAVE_DELAY_MS,
    [
      items,
      storeId,
      draftId,
      mutateAsync,
      setActionStatus,
      setLocalDraft,
      clearLocalDraft,
    ]
  );

  /** 서버 초안이 없을 때 복원에 쓸 마지막 로컬 저장본. draftId가 있으면 비어 있다. */
  return { localDraft, clearLocalDraft };
}
