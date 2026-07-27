import { StaticFormField } from "../../../components/form/FormFields.type";
import { MenuFormPayload } from "../../types/menu-form-payload.type";

export const staticAddMenuFields: StaticFormField<MenuFormPayload>[] = [
  {
    id: "name",
    label: "메뉴 이름",
    placeholder: "아메리카노",
    required: true,
    type: "text",
  },
  {
    id: "price",
    label: "메뉴 가격",
    placeholder: "4000",
    required: true,
    type: "number",
  },
  {
    id: "categoryId",
    label: "카테고리",
    placeholder: "음료",
    required: true,
    type: "select",
    description:
      "메뉴가 속할 카테고리를 선택합니다. 카테고리는 메뉴를 그룹화하고 필터링하는 데 사용됩니다.",
  },
  {
    id: "imageKey",
    label: "메뉴 이미지 업로드",
    required: true,
    type: "file",
  },
  {
    id: "sortOrder",
    label: "정렬 순서",
    placeholder: "아메리카노 다음",
    type: "select",
    description: (
      <span className="text-muted-foreground">
        <span>카테고리를 먼저 선택해주세요.</span>
        <br />
        <span className="font-semibold">
          입력하지 않을 경우 카테고리 내 메뉴의 마지막 순서로 추가됩니다.
        </span>
      </span>
    ),
  },
  {
    id: "requiredOptions",
    label: "필수 옵션",
    description:
      "주문 시 반드시 하나를 선택해야 하는 옵션입니다. (예: 사이즈, 원두)",
    type: "option",
    addOptionGroupButtonLabel: "+ 필수 옵션 그룹 추가",
  },
  {
    id: "customOptions",
    label: "선택 옵션",
    description:
      "고객이 원할 때 추가로 선택하는 옵션입니다. 다른 옵션 선택값에 따른 노출 조건을 걸 수 있어요.",
    type: "option",
    addOptionGroupButtonLabel: "+ 선택 옵션 그룹 추가",
  },
  {
    id: "description",
    label: "메뉴 설명",
    placeholder: "맛있는 아메리카노",
    type: "text",
  },
  {
    id: "isAvailable",
    label: "활성화",
    type: "switch",
    legend: "활성화 여부",
    description:
      "활성화 여부를 설정합니다. 비활성화된 메뉴는 주문이 불가능합니다.",
  },
];
