/**
 * 주문·장바구니에 저장된 옵션 스냅샷을 화면 문자열로 바꾼다.
 *
 * 스냅샷은 이름과 금액을 이미 품고 있어 메뉴를 다시 조회할 필요가 없다 —
 * 주문 후 옵션 이름이 바뀌거나 삭제돼도 주문 당시 그대로 보여야 하므로 이 값만 믿는다.
 */

export type SnapshotChoice = {
  choiceId: string;
  name: string;
  priceDelta: number;
  quantity: number;
};

export type SnapshotGroup = {
  optionId: string;
  name: string;
  choices: SnapshotChoice[];
};

export type SnapshotLine = {
  optionId: string;
  /** 옵션 이름 (예: "샷 추가") */
  name: string;
  /** 선택 결과 한 줄 (예: "에스프레소 샷 x2, 시럽") */
  value: string;
};

/** 수량이 1이면 붙이지 않는다 — 대부분의 옵션은 수량 개념이 없어 "x1"이 잡음이 된다. */
function choiceLabel(choice: SnapshotChoice): string {
  return choice.quantity > 1
    ? `${choice.name} x${choice.quantity}`
    : choice.name;
}

export function toSnapshotLines(
  options: SnapshotGroup[] | null | undefined
): SnapshotLine[] {
  if (!options?.length) return [];

  return options.map((option) => ({
    optionId: option.optionId,
    name: option.name,
    value: option.choices.map(choiceLabel).join(", "),
  }));
}

/** 배지 하나에 담을 축약 문자열. 예: "온도 · ICE" */
export function toSnapshotBadges(
  options: SnapshotGroup[] | null | undefined
): { key: string; label: string }[] {
  return toSnapshotLines(options).map((line) => ({
    key: line.optionId,
    label: `${line.name} · ${line.value}`,
  }));
}
