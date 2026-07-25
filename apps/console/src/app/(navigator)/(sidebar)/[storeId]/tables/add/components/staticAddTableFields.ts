import { CreateTablePayload } from "@ssurak/api/schemas/model/table.schema";
import { StaticInputField } from "@/app/(navigator)/(sidebar)/[storeId]/components/form/FormInputField";
import { StaticCheckboxField } from "../../../components/form/FormToggleField";

/** 테이블 폼은 select 필드를 쓰지 않는다. */
export const staticAddTableFields: (
  | StaticInputField<CreateTablePayload>
  | StaticCheckboxField<CreateTablePayload>
)[] = [
  {
    id: "tableNumber",
    label: "테이블 번호",
    placeholder: "1-1",
    required: true,
    type: "text",
  },
  {
    id: "seats",
    label: "좌석 수",
    placeholder: "4",
    type: "number",
  },
  {
    id: "floor",
    label: "층",
    placeholder: "1",
    type: "number",
    description:
      "추후 층별로 테이블을 필터링할 수 있도록 구현 예정입니다. 예: 1층, 2층, 3층 등",
  },
  {
    id: "section",
    label: "구역",
    type: "text",
    placeholder: "메인 홀",
    description:
      "추후 구역을 기준으로 테이블을 필터링할 수 있도록 구현 예정입니다. 예: 메인 홀, 테라스, VIP룸 등",
  },
  {
    id: "isActive",
    label: "활성화",
    type: "switch",
    legend: "활성화 여부",
    description:
      "활성화 여부를 설정합니다. 비활성화된 테이블은 주문이 불가능합니다.",
  },
];
