import ServerPrefetch from "@/app/(navigator)/components/ServerPrefetch";
import { Metadata } from "next";
import { use } from "react";
import NoticeScheduledOpen from "../../tables/[tableId]/components/NoticeScheduledOpen";

export const metadata: Metadata = {
  title: "메뉴 상세 정보 - ssurak",
  description: "메뉴의 관련된 정보를 확인할 수 있는 페이지입니다.",
};

export type MenuDetailPageProps = {
  params: Promise<{ storeId: string; menuId: string }>;
};

export default function MenuDetailPage({ params }: MenuDetailPageProps) {
  const { storeId, menuId } = use(params);

  return (
    <div className="flex flex-col gap-6">
      <ServerPrefetch url={`/stores/v1/${storeId}/menus/${menuId}`}>
        <NoticeScheduledOpen
          content="추후 메뉴의 상세한 지표를 확인할 수 있습니다."
          title="메뉴 상세 정보"
        />
      </ServerPrefetch>
    </div>
  );
}
