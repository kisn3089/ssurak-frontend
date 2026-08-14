"use client";

import useSuspenseWithAuth from "@ssurak/api/hooks/useSuspenseWithAuth";
import { menuDraftListUrl } from "@ssurak/api/core/store/menu/draft/useMenuDraftMutation";
import { MenuDraftListResponse } from "@ssurak/api/types/menuDraft/menuDraft.interface";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import DraftSummaryWithThumbnails from "./DraftSummaryWithThumbnails";

export default function RecentDraftList() {
  const { storeId } = useParams<{ storeId: string }>();
  const { data } = useSuspenseWithAuth<MenuDraftListResponse>(
    menuDraftListUrl(storeId)
  );

  if (data.drafts.length === 0) return null;

  return (
    <>
      {data.drafts.map((draft) => (
        <li key={draft.draftId}>
          <Link href={`/${storeId}/menus/bulk?draftId=${draft.draftId}`}>
            <DraftSummaryWithThumbnails draft={draft}>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
            </DraftSummaryWithThumbnails>
          </Link>
        </li>
      ))}
    </>
  );
}
