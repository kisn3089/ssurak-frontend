import {
  CreateMenuOptionPayload,
  createMenuOptionPayloadSchema,
} from "@ssurak/api/schemas/model/menuOption.schema";
import { OptionGroupForm } from "../types/option-form.type";
import {
  toChoicePayload,
  toOptionFieldPath,
  toOptionPayload,
} from "../utils/menu-option-form";
import { MenuOptionGroup } from "@ssurak/api/types/menu/menuOptions.interface";
import { useState } from "react";
import { UseFormSetError } from "react-hook-form";

export default function useValidateOptionField(
  option: MenuOptionGroup | undefined,
  savedOptions: MenuOptionGroup[],
  setError: UseFormSetError<OptionGroupForm>
) {
  const [serverError, setServerError] = useState<string>();

  /**
   * 서버와 같은 스키마로 먼저 걸러 400 왕복을 줄인다.
   * 이슈 경로가 폼 필드 경로와 같은 모양이라 그대로 해당 입력 아래에 붙는다.
   */
  const validate = (
    values: OptionGroupForm
  ): CreateMenuOptionPayload | null => {
    const payload: CreateMenuOptionPayload = {
      ...toOptionPayload(values),
      choices: values.choices.map(toChoicePayload),
    };

    const parsed = createMenuOptionPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      const unmapped: string[] = [];

      parsed.error.issues.forEach((issue) => {
        const path = toOptionFieldPath(issue.path);
        if (path) {
          setError(path, { type: "manual", message: issue.message });
          return;
        }
        unmapped.push(issue.message);
      });

      setServerError(unmapped[0]);
      return null;
    }

    // 이름 중복은 스키마가 알 수 없다 — 같은 메뉴 안에서만 유일하면 된다.
    const isDuplicated = savedOptions.some(
      (candidate) =>
        candidate.publicId !== option?.publicId &&
        candidate.name === payload.name
    );
    if (isDuplicated) {
      setError("name", {
        type: "manual",
        message: "이미 있는 옵션 이름입니다.",
      });
      return null;
    }

    return payload;
  };

  return { validate, serverError, setServerError };
}
