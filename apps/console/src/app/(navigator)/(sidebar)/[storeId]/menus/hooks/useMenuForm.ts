import useSuspenseWithAuth from "@ssurak/api/hooks/useSuspenseWithAuth";
import { CategoryWithMenusResponse } from "@ssurak/api/types/category/category.interface";
import { useParams } from "next/navigation";
import { SelectOption } from "../../components/form/select-form-field/SelectFormField";
import { MenuFormValues } from "../../tables/types/menu-form.type";
import { buildExpectedOrder, NEW_MENU_ID } from "../utils/menu-sort-order";

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

  // 생성 화면의 메뉴는 아직 publicId가 없으므로 자리표시자로 자리를 잡는다.
  const selfId = formDefaultValues.publicId ?? NEW_MENU_ID;

  // 정렬 목록의 초기값은 "지금 제출하면 서버가 갖게 될 순서"다.
  // 수정 화면이면 편집 중인 메뉴가 제자리에 있고, 생성 화면이면 맨 뒤에 붙는다.
  const defaultSortOrder = buildExpectedOrder(
    (defaultCategory?.menus ?? []).map((menu) => menu.publicId),
    selfId
  );

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
    selfId,
  };
}
