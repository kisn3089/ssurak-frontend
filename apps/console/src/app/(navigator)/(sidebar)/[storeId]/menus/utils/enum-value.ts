/**
 * const object로 선언한 도메인 enum(`OptionChoiceState`, `OptionSelectionType` 등)의
 * 값인지 검사하면서 타입을 좁힌다.
 */
export function isEnumValue<T extends Record<string, string>>(
  enumObject: T,
  value: string
): value is T[keyof T] {
  return Object.values<string>(enumObject).includes(value);
}
