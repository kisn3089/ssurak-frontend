import { menuDraftUrl } from "@ssurak/api/core/store/menu/draft/useMenuDraftMutation";
import useQueryWithAuth from "@ssurak/api/hooks/useQueryWithAuth";
import { draftIdSchema } from "@ssurak/api/schemas/model/menuDraft.schema";
import { MenuDraftResponse } from "@ssurak/api/types/menuDraft/menuDraft.interface";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { DraftReviewFormValues, toFormValues } from "../utils/draft-review";
import { UseFormReset } from "react-hook-form";

const NO_DRAFT_ID = "none";

export default function useSyncServerDraftEffect(
  reset: UseFormReset<DraftReviewFormValues>
) {
  const { storeId } = useParams<{ storeId: string }>();

  const searchParams = useSearchParams();
  const validatedDraftId = draftIdSchema.safeParse(
    searchParams.get("draftId") ?? ""
  );
  const draftId = validatedDraftId.success ? validatedDraftId.data : null;

  const draftResult = useQueryWithAuth<MenuDraftResponse>(
    menuDraftUrl(storeId, draftId ?? NO_DRAFT_ID),
    { enabled: !!draftId }
  );

  const hydratedDraftIdRef = useRef<string | null>(null);

  useEffect(() => {
    const serverDraft = draftResult.data;
    if (!serverDraft) return;
    if (hydratedDraftIdRef.current === serverDraft.draftId) return;

    hydratedDraftIdRef.current = serverDraft.draftId;
    reset(toFormValues(serverDraft.items));
  }, [draftResult.data, reset]);

  return draftResult;
}
