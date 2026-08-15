import { MenuDraftSummary } from "@ssurak/api/types/menuDraft/menuDraft.interface";
import DraftSourceThumbnails from "../DraftSourceThumbnails";
import DraftSummary from "./DraftSummary";
import RecentDraftSkeleton from "./RecentDraftSkeleton";

type DraftSummaryWithThumbnailsProps = {
  draft?: MenuDraftSummary;
  isLoading?: boolean;
  children?: React.ReactNode;
};

export default function DraftSummaryWithThumbnails({
  draft,
  isLoading,
  children,
}: DraftSummaryWithThumbnailsProps) {
  if (!draft && isLoading) {
    return <RecentDraftSkeleton count={1} />;
  }

  if (!draft) return null;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-2 shadow-lg outline-none hover:bg-accent focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 pressable:scale-95 transition-all">
      <DraftSourceThumbnails sourceImages={draft.sourceImages} />
      <DraftSummary draft={draft} />
      {children}
    </div>
  );
}
