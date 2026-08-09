import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@ssurak/ui/components/animate-ui/components/tabs";
import useQueryParams from "../../../hooks/useQueryParams";
import FilterLayout from "./FilterLayout";

/** 쿼리 파라미터가 없을 때 선택되는 기본 탭. URL에는 기록하지 않는다. */
const ALL_TAB_VALUE = "all";

type TabInfo = { label: string; id: string };
type FilterTabsProps<TabName extends string> = {
  tabs: Record<TabName, TabInfo[]>;
  allTab?: Partial<Record<NoInfer<TabName>, string>>;
};

export default function FilterTabs<TabName extends string>({
  tabs,
  allTab,
}: FilterTabsProps<TabName>) {
  const { getParams, addParams, deleteParams } = useQueryParams();

  const allTabLabel: Record<string, string | undefined> = allTab ?? {};

  return (
    <FilterLayout>
      {Object.entries<TabInfo[]>(tabs).map(([tabName, tabList]) => (
        <Tabs
          key={tabName}
          value={
            getParams(tabName) || (allTabLabel[tabName] ? ALL_TAB_VALUE : "")
          }
          onValueChange={(value) => {
            if (value === ALL_TAB_VALUE) {
              deleteParams(tabName);
              return;
            }

            addParams(tabName, value);
          }}
        >
          <TabsList>
            {allTabLabel[tabName] && (
              <TabsTrigger value={ALL_TAB_VALUE}>
                {allTabLabel[tabName]}
              </TabsTrigger>
            )}
            {tabList.map((tab, i) => (
              <TabsTrigger key={`${tab.id}-${i}`} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ))}
    </FilterLayout>
  );
}
