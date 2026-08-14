import { Badge } from "@ssurak/ui/components/forms/badge";
import SummaryTitle from "./SummaryTitle";
import DraftCreatedAt from "./DraftCreatedAt";
import DraftExpiryProgress from "./DraftExpiryProgress";
import {
  MenuDraftStatus,
  MenuDraftSummary,
} from "@ssurak/api/types/menuDraft/menuDraft.interface";

const DRAFT_STATUS_MAP: Record<
  MenuDraftStatus,
  { label: string; variants: "active" | "default" }
> = {
  [MenuDraftStatus.READY]: { label: "편집 중", variants: "active" },
  [MenuDraftStatus.COMMITTED]: { label: "등록 완료", variants: "default" },
};

export default function DraftSummary({ draft }: { draft: MenuDraftSummary }) {
  return (
    <div className="flex-1 flex items-center justify-between gap-0.5">
      <div className="flex flex-col gap-y-0.5">
        <SummaryTitle itemCount={draft.itemCount} />
        <Badge
          variant={DRAFT_STATUS_MAP[draft.status].variants}
          className="w-fit text-xs"
        >
          {DRAFT_STATUS_MAP[draft.status].label}
        </Badge>
      </div>
      <div className="flex items-center flex-col justify-end gap-2 md:basis-40">
        <DraftCreatedAt createdAt={draft.createdAt} />
        <DraftExpiryProgress expiresAt={draft.expiresAt} />
      </div>
    </div>
  );
}
