"use client";

import useSuspenseWithAuth from "@ssurak/api/hooks/useSuspenseWithAuth";
import { menuDraftListUrl } from "@ssurak/api/core/store/menu/draft/useMenuDraftMutation";
import { MenuDraftListResponse } from "@ssurak/api/types/menuDraft/menuDraft.interface";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import DraftSummaryWithThumbnails from "./DraftSummaryWithThumbnails";
import EmptyRecentDrafts from "./EmptyRecentDrafts";
import Remaining from "./Remaining";

export default function RecentDraftList() {
  const { storeId } = useParams<{ storeId: string }>();
  const { data } = useSuspenseWithAuth<MenuDraftListResponse>(
    menuDraftListUrl(storeId)
  );
  const { drafts, remaining, resetAt } = data;

  if (drafts.length === 0)
    return (
      <Remaining remaining={remaining} resetAt={resetAt}>
        <EmptyRecentDrafts />
      </Remaining>
    );

  return (
    <Remaining remaining={remaining} resetAt={resetAt}>
      {drafts.map((draft) => (
        <li key={draft.draftId}>
          <Link href={`/${storeId}/menus/bulk?draftId=${draft.draftId}`}>
            <DraftSummaryWithThumbnails draft={draft}>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
            </DraftSummaryWithThumbnails>
          </Link>
        </li>
      ))}
    </Remaining>
  );
}
