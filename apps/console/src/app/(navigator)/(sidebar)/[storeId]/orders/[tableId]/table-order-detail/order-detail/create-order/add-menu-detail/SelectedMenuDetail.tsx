"use client";

import { menuOptionsUrl } from "@ssurak/api/core/store/menu/option/httpMenuOption";
import useQueryWithAuth from "@ssurak/api/hooks/useQueryWithAuth";
import { MenuOptionGroup } from "@ssurak/api/types/menu/menuOptions.interface";
import { MenuDetail } from "@ssurak/ui/components/menu/menu-detail";
import { Spinner } from "@ssurak/ui/components/spinner";
import { useParams } from "next/navigation";
import { useCreateOrderContext } from "../CreateOrderProvider";
import AddMenuButton from "./AddMenuButton";
import AddMenuDetailLayout from "./AddMenuDetailLayout";
import DivideLine from "@ssurak/ui/components/menu/menu-detail/DivideLine";

/**
 * 고른 메뉴의 옵션을 옵션 API로 따로 받아온다.
 *
 * 점주 메뉴 목록 응답에는 옵션이 실리지 않는다 — 옵션만 바뀌었을 때 메뉴 목록 캐시까지
 * 무효화하지 않으려고 분리했기 때문이다. 수정 진입이면 담아둔 선택을 그대로 복원한다.
 */
export default function SelectedMenuDetail() {
  const { storeId } = useParams<{ storeId: string }>();
  const {
    state: { selectedMenu, editingMenu },
  } = useCreateOrderContext();

  const { data: options } = useQueryWithAuth<MenuOptionGroup[]>(
    selectedMenu ? menuOptionsUrl(storeId, selectedMenu.publicId) : "",
    { enabled: Boolean(selectedMenu) }
  );

  if (!selectedMenu) return null;

  if (!options) {
    return (
      <AddMenuDetailLayout title={null} button={null}>
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      </AddMenuDetailLayout>
    );
  }

  return (
    <MenuDetail.Provider
      menu={{ ...selectedMenu, quantity: editingMenu?.quantity || 1, options }}
      initialSelections={editingMenu?.options}
      key={selectedMenu.publicId}
    >
      <AddMenuDetailLayout
        title={<MenuDetail.Info />}
        button={<AddMenuButton />}
      >
        <DivideLine label="옵션 선택" labelPosition="center" />
        <MenuDetail.Options />
      </AddMenuDetailLayout>
    </MenuDetail.Provider>
  );
}
