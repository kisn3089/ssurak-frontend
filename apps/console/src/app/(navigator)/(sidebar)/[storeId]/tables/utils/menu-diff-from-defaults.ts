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
  if (isFalsy(form.description) !== isFalsy(defaults.description)) {
    changed.description = isFalsy(form.description) ?? null;
  }

  return changed;
}
