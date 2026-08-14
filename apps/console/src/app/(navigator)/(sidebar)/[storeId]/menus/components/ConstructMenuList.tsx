"use client";

import useSuspenseWithAuth from "@ssurak/api/hooks/useSuspenseWithAuth";
import { CategoryWithMenusResponse } from "@ssurak/api/types/category/category.interface";
import { Pagination } from "../../components/table-view/pagination";
import MenuListView from "./MenuListView";
import useQueryParams from "../../hooks/useQueryParams";
import { useParams } from "next/navigation";
import ConstructTableListLayout from "../../components/table-view/table/ConstructTableListLayout";
import FilterTabs from "../../components/table-view/filter/FilterTabs";
import useSliceByPage from "../../hooks/useSliceByPage";
import EmptyMenu from "./EmptyMenu";

interface ConstructMenuListProps {
  children: React.ReactNode;
}

export default function ConstructMenuList({
  children,
}: ConstructMenuListProps) {
  const { storeId } = useParams<{ storeId: string }>();
  const { data: categoryWithMenuList } = useSuspenseWithAuth<
    CategoryWithMenusResponse[]
  >(`/stores/v1/${storeId}/menus`);

  const { getParams } = useQueryParams();

  const categoryId = getParams("categoryId");

  const findCategory = (categoryWithMenus: CategoryWithMenusResponse) =>
    categoryWithMenus.publicId === categoryId;

  const filteredMenuList = categoryId
    ? (categoryWithMenuList.find(findCategory)?.menus ?? [])
    : categoryWithMenuList.flatMap((category) => category.menus);

  const slicedMenuList = useSliceByPage(filteredMenuList);

  const categoryList = categoryWithMenuList.map((category) => ({
    label: category.name,
    id: category.publicId,
  }));

  if (categoryWithMenuList.every((category) => category.menus.length === 0)) {
    return <EmptyMenu />;
  }

  return (
    <>
      <FilterTabs
        tabs={{ categoryId: categoryList }}
        allTab={{ categoryId: "전체" }}
      />
      <ConstructTableListLayout
        body={<MenuListView menuList={slicedMenuList} />}
      >
        {children}
      </ConstructTableListLayout>
      <footer className="pt-8">
        <Pagination dataLength={filteredMenuList.length} />
      </footer>
    </>
  );
}
