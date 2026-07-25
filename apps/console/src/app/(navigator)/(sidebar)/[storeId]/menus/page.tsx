import { sideMenuItem } from "@/shared/config/sidebarGroup";
import PageTitle from "../components/PageTitle";
import HeaderLinkButton from "../components/HeaderLinkButton";
import { Plus } from "lucide-react";
import { Suspense, use } from "react";
import MainLayout from "../components/MainLayout";
import ConstructMenuList from "./components/ConstructMenuList";
import { menuHeaders } from "./components/menu-headers";
import ServerPrefetch from "@/app/(navigator)/components/ServerPrefetch";
import { Metadata } from "next";
import TableListSkeleton from "../components/table-view/table/TableListSkeleton";
import TableListHeader from "../components/table-view/table/TableListHeader";
import FilterListSkeleton from "../components/table-view/filter/FilterListSkeleton";

export const metadata: Metadata = {
  title: "메뉴 설정 - ssurak",
  description: "메뉴를 관리하고, 메뉴를 추가/삭제할 수 있는 페이지입니다.",
};

export default function MenusSettingPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = use(params);

  return (
    <MainLayout>
      <PageTitle title={sideMenuItem.title} Icon={sideMenuItem.icon}>
        <HeaderLinkButton linkTo="menus/add" icon={<Plus strokeWidth={2.5} />}>
          <span>메뉴 추가</span>
        </HeaderLinkButton>
      </PageTitle>
      <Suspense
        fallback={
          <>
            <FilterListSkeleton />
            <TableListSkeleton row={5} column={5}>
              <TableListHeader headers={menuHeaders} />
            </TableListSkeleton>
          </>
        }
      >
        <ServerPrefetch url={`/stores/v1/${storeId}/menus`}>
          <ConstructMenuList>
            <TableListHeader headers={menuHeaders} />
          </ConstructMenuList>
        </ServerPrefetch>
      </Suspense>
    </MainLayout>
  );
}
