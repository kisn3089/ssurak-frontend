"use client";

import { Table } from "@ssurak/api/types/table/table.interface";
import TableListView from "./TableListView";
import useSuspenseWithAuth from "@ssurak/api/hooks/useSuspenseWithAuth";
import { useParams } from "next/navigation";
import { Pagination } from "../../components/table-view/pagination";
import FilterTabs from "../../components/table-view/filter/FilterTabs";
import ConstructTableListLayout from "../../components/table-view/table/ConstructTableListLayout";
import useFilterTableList from "../../hooks/useFilterTableList";
import useSliceByPage from "../../hooks/useSliceByPage";
import buildTableTabList from "./build-tab-list";

interface ConstructTableListProps {
  children: React.ReactNode;
}

export default function ConstructTableList({
  children,
}: ConstructTableListProps) {
  const { storeId } = useParams<{ storeId: string }>();
  const { data: tableList } = useSuspenseWithAuth<Table[]>(
    `/stores/v1/${storeId}/tables`
  );

  const filteredTableList = useFilterTableList(tableList);
  const slicedTableList = useSliceByPage(filteredTableList);

  const tabs = buildTableTabList(tableList);

  return (
    <>
      <FilterTabs
        tabs={tabs}
        allTab={{ section: "전체 구역", floor: "전체 층" }}
      />
      <ConstructTableListLayout
        body={
          <TableListView
            tableList={slicedTableList}
            hrefPrefix="tables"
            toastPrefix="테이블"
          />
        }
      >
        {children}
      </ConstructTableListLayout>
      <footer className="pt-8">
        <Pagination dataLength={filteredTableList.length} />
      </footer>
    </>
  );
}
