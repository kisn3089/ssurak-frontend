import SectionLayout from "../../components/SectionLayout";
import RecentDraftLayout from "./components/draft/RecentDraftLayout";
import RecentDraftSkeleton from "./components/draft/RecentDraftSkeleton";
import { IMPORT_PAGE_DESCRIPTION } from "./constants/page-copy";

export default function ImportMenusLoading() {
  return (
    <SectionLayout
      title="사진으로 메뉴 일괄 등록"
      description={IMPORT_PAGE_DESCRIPTION}
    >
      <RecentDraftLayout>
        <RecentDraftSkeleton count={3} />
      </RecentDraftLayout>
      <div className="h-32 rounded-xl border border-dashed bg-background animate-pulse" />
    </SectionLayout>
  );
}
