"use client";

import { useState } from "react";
import ConstructTableListLayout from "../../../components/table-view/table/ConstructTableListLayout";
import useSuspenseWithAuth from "@ssurak/api/hooks/useSuspenseWithAuth";
import { useParams } from "next/navigation";
import { Menu } from "@ssurak/api/types/menu/menu.interface";
import DeletedMenuListView from "./DeletedMenuListView";
import SummaryDeletedMenu from "./SummaryDeletedMenu";

export default function DeletedMenus() {
  const { storeId } = useParams<{ storeId: string }>();
  const [isOpen, setIsOpen] = useState(false);

  const { data: deletedMenuList } = useSuspenseWithAuth<Menu[]>(
    `/stores/v1/${storeId}/menus/deleted`
  );

  if (deletedMenuList.length === 0) return null;

  return (
    <ConstructTableListLayout
      body={isOpen && <DeletedMenuListView deletedMenuList={deletedMenuList} />}
    >
      <SummaryDeletedMenu
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        deletedMenuCount={deletedMenuList.length}
      />
    </ConstructTableListLayout>
  );
}
