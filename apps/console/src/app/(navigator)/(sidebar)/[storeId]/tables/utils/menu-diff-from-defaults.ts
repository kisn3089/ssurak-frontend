import {
  CreateMenuPayload,
  UpdateMenuPayload,
} from "@ssurak/api/schemas/model/menu.schema";
import { MenuFormValues } from "../types/menu-form.type";
import { isFalsy } from "./table-diff-from-defaults";

export function menuDiffFromDefaults(
  form: CreateMenuPayload,
  defaults: MenuFormValues
): UpdateMenuPayload {
  const changed: UpdateMenuPayload = {};

  if (form.name !== defaults.name) {
    changed.name = form.name;
  }
  if (form.sortOrder !== defaults.sortOrder) {
    changed.sortOrder = form.sortOrder;
  }
  if (form.price !== defaults.price) {
    changed.price = form.price;
  }
  if (form.categoryId !== defaults.categoryId) {
    changed.categoryId = form.categoryId;
  }
  if (form.isAvailable !== defaults.isAvailable) {
    changed.isAvailable = form.isAvailable;
  }
  if (form.imageKey !== defaults.imageKey) {
    changed.imageKey = form.imageKey;
  }
  if (!deepEqual(form.customOptions ?? null, defaults.customOptions ?? null)) {
    changed.customOptions = form.customOptions ?? null;
  }
  if (
    !deepEqual(form.requiredOptions ?? null, defaults.requiredOptions ?? null)
  ) {
    changed.requiredOptions = form.requiredOptions ?? null;
  }
  if (isFalsy(form.description) !== isFalsy(defaults.description)) {
    changed.description = isFalsy(form.description) ?? null;
  }

  return changed;
}

// 옵션은 record + 배열로 이뤄진 중첩 값이라 참조 비교(!==)로는 내용이 같아도
// 다른 인스턴스를 변경으로 판단한다. 배열은 순서 민감, 객체 키는 순서 무관으로 비교한다.
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== "object" || typeof b !== "object") return false;

  const aIsArray = Array.isArray(a);
  const bIsArray = Array.isArray(b);
  if (aIsArray !== bIsArray) return false;

  if (aIsArray && bIsArray) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  const aObject = a as Record<string, unknown>;
  const bObject = b as Record<string, unknown>;
  const aKeys = Object.keys(aObject);
  const bKeys = Object.keys(bObject);
  if (aKeys.length !== bKeys.length) return false;

  return aKeys.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(bObject, key) &&
      deepEqual(aObject[key], bObject[key])
  );
}
