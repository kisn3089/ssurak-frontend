import SectionLayout from "../../components/SectionLayout";
import DraftReviewSkeleton from "./components/DraftReviewSkeleton";
import { DRAFT_REVIEW_PAGE_DESCRIPTION } from "../import/constants/page-copy";

export default function ImportDraftReviewLoading() {
  return (
    <SectionLayout
      title="여러 메뉴 추가"
      description={DRAFT_REVIEW_PAGE_DESCRIPTION}
      renderRightHeader={
        <div className="h-11 w-48 rounded-3xl bg-accent animate-pulse border border-border" />
      }
    >
      <DraftReviewSkeleton count={3} />
    </SectionLayout>
  );
}
