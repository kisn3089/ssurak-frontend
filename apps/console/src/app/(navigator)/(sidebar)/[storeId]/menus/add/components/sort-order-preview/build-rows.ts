import { Menu } from "@ssurak/api/types/menu/menu.interface";
import { getInsertIndex, getNewSortOrder } from "./get-new-sort-order";

export type PreviewRow = {
  key: string;
  name: string;
  sortOrder: number;
  isNew: boolean;
};

/** 선택한 삽입 위치를 반영해 새 메뉴가 낄 자리와 표시 순서 번호를 계산한다. */
export function buildRows(
  menus: Menu[],
  newMenuName: string,
  sortOrder: number | undefined,
  defaultSortOrder: number | undefined
): PreviewRow[] {
  const rows: PreviewRow[] = menus.map((menu) => ({
    key: menu.publicId,
    name: menu.name,
    sortOrder: menu.sortOrder,
    isNew: false,
  }));

  rows.splice(getInsertIndex(menus, sortOrder), 0, {
    key: "__new-menu__",
    name: newMenuName,
    sortOrder: defaultSortOrder ?? getNewSortOrder(menus, sortOrder),
    isNew: true,
  });

  return rows;
}
