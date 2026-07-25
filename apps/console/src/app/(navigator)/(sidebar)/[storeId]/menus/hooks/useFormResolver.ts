import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, FieldValues, Resolver } from "react-hook-form";
import type { ZodType, ZodTypeDef } from "zod";

/**
 * zodResolver(v5)가 zod v3 스키마로 인식하려면 `_def.typeName`이 있어야 한다.
 * 기본 ZodType에는 없으므로 교차 타입으로 보강한다. (실제 ZodObject 등에는 존재)
 */
type ZodV3Schema<Payload> = ZodType<Payload, ZodTypeDef, Payload> & {
  _def: { typeName: string };
};

type StringFieldKey<Payload> = {
  [Key in keyof Payload]: NonNullable<Payload[Key]> extends string
    ? Key
    : never;
}[keyof Payload] &
  string;

interface UseFormResolverParams<Payload extends FieldValues> {
  schema: ZodV3Schema<Payload>;
  /** 이미 존재하는 값 집합 (편집 중인 자기 자신은 제외되어야 함) */
  existingValues: Set<string>;
  /** 중복 검사 및 에러를 붙일 문자열 필드 */
  field: StringFieldKey<Payload>;
  /** 중복일 때 표시할 메시지 */
  duplicateMessage: string;
}

export default function useFormResolver<Payload extends FieldValues>({
  schema,
  existingValues,
  field,
  duplicateMessage,
}: UseFormResolverParams<Payload>): Resolver<Payload> {
  const zodResolve = zodResolver(schema);

  return async (values, ...options) => {
    const result = await zodResolve(values, ...options);

    const value = values[field];
    const normalized = typeof value === "string" ? value.trim() : value;

    if (typeof normalized === "string" && existingValues.has(normalized)) {
      const errors: FieldErrors<Payload> = {};
      Object.assign(errors, result.errors, {
        [field]: { type: "manual", message: duplicateMessage },
      });
      return { values: {}, errors };
    }

    return result;
  };
}
