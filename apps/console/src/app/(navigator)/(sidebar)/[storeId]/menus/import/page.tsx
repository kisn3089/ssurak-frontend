import { Metadata } from "next";
import { Suspense, use } from "react";
import SectionLayout from "../../components/SectionLayout";
import MultipleImageUploader from "./components/MultipleImageUploader";
import RecentDraftList from "./components/draft/RecentDraftList";
import RecentDraftPrefetch from "./components/draft/RecentDraftPrefetch";
import RecentDraftLayout from "./components/draft/RecentDraftLayout";
import RecentDraftSkeleton from "./components/draft/RecentDraftSkeleton";
import { IMPORT_PAGE_DESCRIPTION } from "./constants/page-copy";
import QueryErrorFallback from "@/app/common/QueryErrorFallback";
import FailedGetTableView from "@/app/common/FailedGetTableView";

export const metadata: Metadata = {
  title: "AI 메뉴 추출 - ssurak",
  description: "사진을 업로드하여 메뉴를 추출할 수 있는 페이지입니다.",
};

export default function ImportMenusPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = use(params);

  return (
    <SectionLayout
      title="사진으로 메뉴 일괄 등록"
      description={IMPORT_PAGE_DESCRIPTION}
    >
      <RecentDraftLayout>
        <QueryErrorFallback
          FallbackComponent={FailedGetTableView}
          fallbackProps={{
            title: "작성중인 메뉴를 불러오는 중 오류가 발생했습니다.",
          }}
        >
          <Suspense fallback={<RecentDraftSkeleton count={3} />}>
            <RecentDraftPrefetch storeId={storeId}>
              <RecentDraftList />
            </RecentDraftPrefetch>
          </Suspense>
        </QueryErrorFallback>
      </RecentDraftLayout>
      <MultipleImageUploader />
    </SectionLayout>
  );
}
