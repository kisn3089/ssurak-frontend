import { Metadata } from "next";
import { use } from "react";
import SectionLayout from "../../../components/SectionLayout";
import ServerPrefetch from "@/app/(navigator)/components/ServerPrefetch";
import { MenuDetailPageProps } from "../page";
import MenuEditForm from "../components/MenuEditForm";

const description =
  "메뉴의 정보를 수정할 수 있습니다. 수정된 메뉴의 정보는 고객에게 바로 반영됩니다. 메뉴 번호는 중복될 수 없으며, 메뉴의 활성화 상태를 변경할 수 있습니다.";

export const metadata: Metadata = {
  title: "메뉴 수정 - ssurak",
  description: "메뉴의 상태를 수정하는 페이지입니다.",
};

export default function MenuEditPage({ params }: MenuDetailPageProps) {
  const { storeId, menuId } = use(params);

  return (
    <SectionLayout title="메뉴 수정" description={description}>
      <ServerPrefetch url={`/stores/v1/${storeId}/menus`}>
        <ServerPrefetch url={`/stores/v1/${storeId}/menus/${menuId}`}>
          <MenuEditForm />
        </ServerPrefetch>
      </ServerPrefetch>
    </SectionLayout>
  );
}
