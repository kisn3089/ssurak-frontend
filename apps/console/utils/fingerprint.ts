import { MenuOptionSelection } from "@ssurak/api/types/menu/menuOptions.interface";

/**
 * 옵션 선택을 정규화한다.
 *
 * 서버(장바구니 지문)와 같은 규칙이다: 옵션·선택지 id로 정렬하고 **수량까지 포함**한다.
 * 샷 2개와 1개는 서로 다른 항목이므로, 수량을 빼면 합쳐지면 안 될 것이 합쳐진다.
 */
const canonical = (options?: MenuOptionSelection[]): unknown[] =>
  options
    ? [...options]
        .sort((a, b) => a.optionId.localeCompare(b.optionId))
        .map((option) => [
          option.optionId,
          [...option.choices]
            .sort((a, b) => a.choiceId.localeCompare(b.choiceId))
            .map((choice) => [choice.choiceId, choice.quantity]),
        ])
    : [];

/**
 * 같은 메뉴 + 같은 옵션 조합을 한 항목으로 합치기 위한 식별자.
 *
 * 정규화한 구조를 JSON.stringify로 직렬화한다 — 구분자 문자열로 이어 붙이면
 * id에 그 문자가 섞였을 때 서로 다른 조합이 같은 지문을 낼 수 있다.
 *
 * @example generateFingerprint(item.menuPublicId, item.options);
 */
export function generateFingerprint(
  menuPublicId: string,
  options?: MenuOptionSelection[]
) {
  return JSON.stringify([menuPublicId, canonical(options)]);
}
