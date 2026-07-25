import useSuspenseWithAuth from "@ssurak/api/hooks/useSuspenseWithAuth";
import { CategoryWithMenusResponse } from "@ssurak/api/types/category/category.interface";
import { useParams } from "next/navigation";
import { SelectOption } from "../../components/form/FormSelectField";
import { MenuFormValues } from "../../tables/types/menu-form.type";

export default function useMenuForm(formDefaultValues: MenuFormValues) {
  const { storeId } = useParams<{ storeId: string }>();
  const { data: categoryWithMenus } = useSuspenseWithAuth<
    CategoryWithMenusResponse[]
  >(`/stores/v1/${storeId}/menus`);

  // 서버에서 정렬이 되어 오기 때문에, 클라이언트에서 정렬할 필요가 없다.
  const categoryOptions: SelectOption[] = categoryWithMenus.map((category) => ({
    value: category.publicId,
    label: category.name,
  }));

  // 수정 화면의 formDefaultValues.categoryId는 서버 내부 id(bigint)로 내려온다.
  // 셀렉트 옵션·제출 페이로드는 모두 publicId(cuid2)를 쓰므로 초기값을 publicId로 변환한다.
  const defaultCategory = categoryWithMenus.find(
    (category) => category.id.toString() === formDefaultValues.categoryId
  );
  const defaultCategoryId =
    defaultCategory?.publicId ?? formDefaultValues.categoryId;

  // 수정 화면: 편집 중인 메뉴의 현재 위치를 정렬 셀렉트 초기값으로 잡는다.
  // (맨 앞이면 0 = "맨 앞에 표시", 아니면 바로 앞 메뉴의 sortOrder = "그 메뉴 다음")
  const menusBeforeEdit = defaultCategory?.menus ?? [];
  const editingMenuIndex = menusBeforeEdit.findIndex(
    (menu) => menu.publicId === formDefaultValues.publicId
  );

  const defaultSortOrder =
    editingMenuIndex === -1
      ? formDefaultValues.sortOrder
      : editingMenuIndex === 0
        ? 0
        : menusBeforeEdit[editingMenuIndex - 1].sortOrder;

  const existingMenuNames = new Set<string>(
    categoryWithMenus.flatMap((cat) => cat.menus).map((menu) => menu.name)
  );

  if (formDefaultValues.name) {
    existingMenuNames.delete(formDefaultValues.name);
  }

  return {
    categoryWithMenus,
    categoryOptions,
    defaultCategory,
    defaultCategoryId,
    defaultSortOrder,
    existingMenuNames,
  };
}
