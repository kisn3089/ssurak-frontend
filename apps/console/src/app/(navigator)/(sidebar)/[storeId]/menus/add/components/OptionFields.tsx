"use client";

import { httpMenuOptionErrors } from "@ssurak/api/core/store/menu/option/httpMenuOptionErrors";
import { MenuOptionGroup } from "@ssurak/api/types/menu/menuOptions.interface";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { FormState, useForm } from "react-hook-form";
import ButtonTransDrag from "../../../components/ButtonTransDrag";
import ErrorMessage from "../../../components/form/ErrorMessage";
import { DragRowProps } from "../../../hooks/useDragSort";
import { OptionGroupForm } from "../../types/option-form.type";
import {
  createEmptyOptionGroup,
  toOptionGroupForm,
} from "../../utils/menu-option-form";
import OptionGroup from "./option-field/OptionGroup";
import OptionHeader from "./option-field/OptionHeader";
import OptionLine from "./option-field/OptionLine";
import OptionSettings from "./option-field/OptionSettings";
import OptionValues from "./option-field/OptionValues";
import { TriggerGroupChoice } from "./trigger/TriggerCondition";
import useValidateOptionField from "../../hooks/useValidateOptionField";
import {
  useSetOptionPreviewDrafts,
  withOptionDraft,
  withoutOptionDraft,
} from "../../hooks/useOptionPreviewDrafts";
import { toPreviewOptionGroup } from "../../utils/option-preview";
import {
  CreateMenuOptionPayload,
  UpdateMenuOptionPayload,
} from "@ssurak/api/schemas/model/menuOption.schema";

type OptionFieldsProps = {
  menuId?: string;
  option?: MenuOptionGroup;
  savedOptions: MenuOptionGroup[];
  formId: string;
  /** 순서를 가질 수 있는 카드에만 준다 — 메뉴 수정 화면의 저장된 그룹 */
  drag?: DragRowProps;
  children?: (
    save: () => Promise<void>,
    formState: FormState<OptionGroupForm>
  ) => React.ReactNode;
  invalidateOptions?: () => Promise<void>;
  createOptionCallback?: (payload: CreateMenuOptionPayload) => Promise<void>;
  updateOptionCallbackWithCreatedIdIndex?: (
    option: MenuOptionGroup,
    payload: UpdateMenuOptionPayload,
    values: OptionGroupForm
  ) => Promise<Map<number, string>>;
  deleteOptionCallback?: (id: string) => Promise<void>;
  /** 저장되지 않은 새 그룹을 목록에서 지운다. */
  onDiscard?: () => void;
};

/** 옵션 그룹 한 개를 편집하는 카드. */
export default function OptionFields({
  option,
  savedOptions,
  formId,
  drag,
  children,
  invalidateOptions,
  createOptionCallback,
  updateOptionCallbackWithCreatedIdIndex,
  deleteOptionCallback,
  onDiscard,
}: OptionFieldsProps) {
  "use no memo";

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    setError,
    reset,
    formState,
    subscribe,
  } = useForm<OptionGroupForm>({
    defaultValues: option
      ? toOptionGroupForm(option)
      : createEmptyOptionGroup(),
  });

  const [isSheetOpen, setIsSheetOpen] = useState(!option);

  const setPreviewDrafts = useSetOptionPreviewDrafts();

  useEffect(() => {
    const publish = (values: OptionGroupForm) => {
      const draft = toPreviewOptionGroup(formId, values, option);
      setPreviewDrafts((drafts) => withOptionDraft(drafts, formId, draft));
    };

    publish(getValues());
    const unsubscribe = subscribe({
      formState: { values: true },
      callback: ({ values }) => publish(values),
    });

    return () => {
      unsubscribe();
      setPreviewDrafts((drafts) => withoutOptionDraft(drafts, formId));
    };
  }, [formId, option, setPreviewDrafts, subscribe, getValues]);

  const groupChoices: TriggerGroupChoice[] = savedOptions
    .filter(
      (candidate) =>
        candidate.publicId !== option?.publicId && candidate.choices.length > 0
    )
    .map((candidate) => ({
      optionId: candidate.publicId,
      name: candidate.name,
      choices: candidate.choices.map((choice) => ({
        publicId: choice.publicId,
        name: choice.name,
      })),
    }));

  const { validate, serverError, setServerError } = useValidateOptionField(
    option,
    savedOptions,
    setError
  );

  const save = handleSubmit(async (values) => {
    const payload = validate(values);
    if (!payload) return;

    setServerError(undefined);
    try {
      if (!option) {
        await createOptionCallback?.(payload);
        setIsSheetOpen(false);
        // 저장된 목록이 이 카드를 대신 그리므로 초안은 치운다.
        onDiscard?.();
        return;
      }

      if (updateOptionCallbackWithCreatedIdIndex) {
        const { choices: _choices, ...optionBody } = payload;
        const createdPublicIdByIndex =
          await updateOptionCallbackWithCreatedIdIndex(
            option,
            optionBody,
            values
          );

        // 새로 만든 선택지의 publicId를 폼에 채워야 다음 저장에서 또 만들지 않는다.
        reset({
          ...values,
          choices: values.choices.map((choice, index) => ({
            ...choice,
            publicId: choice.publicId ?? createdPublicIdByIndex.get(index),
          })),
        });
      }

      setIsSheetOpen(false);
    } catch (error) {
      if (isAxiosError(error)) {
        setServerError(
          option
            ? httpMenuOptionErrors.patch(error)
            : httpMenuOptionErrors.post(error)
        );
      }
      // 여러 요청으로 나뉘어 나가므로 중간에 끊겼을 수 있다. 서버 상태를 다시 읽어 맞춘다.
      await invalidateOptions?.();
    }
  });

  const changeSheetOpen = (open: boolean) => {
    setIsSheetOpen(open);
    if (open || !option) return;

    reset();
    setServerError(undefined);
  };

  const deleteOption = async () => {
    if (!option) {
      onDiscard?.();
      return;
    }

    try {
      await deleteOptionCallback?.(option.publicId);
    } catch (error) {
      if (isAxiosError(error)) {
        setServerError(httpMenuOptionErrors.delete(error));
      }
    }
  };

  return (
    <OptionGroup
      control={control}
      hasError={Object.keys(formState.errors).length > 0}
      drag={drag}
      open={isSheetOpen}
      onOpenChange={changeSheetOpen}
      footer={
        <>
          <ButtonTransDrag
            type="button"
            variant="destructive"
            onDragConfirm={deleteOption}
          >
            삭제
          </ButtonTransDrag>
          {children?.(save, formState)}
        </>
      }
    >
      <OptionHeader control={control} formId={formId} />
      <OptionLine label="옵션 설정" />
      <OptionSettings control={control} setValue={setValue} formId={formId} />
      <OptionLine label="선택지" />
      <OptionValues
        control={control}
        setValue={setValue}
        groupChoices={groupChoices}
      />

      {serverError && <ErrorMessage errorMessage={serverError} />}
    </OptionGroup>
  );
}
