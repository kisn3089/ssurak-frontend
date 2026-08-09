import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeQueryKey } from "../../../../utils/makeQueryKey";
import { MenuOptionGroup } from "../../../../types/menu/menuOptions.interface";
import { HttpAxiosError } from "../../../axios/http";
import {
  CreateMenuOptionParams,
  CreateOptionChoiceParams,
  DeleteMenuOptionParams,
  DeleteOptionChoiceParams,
  httpMenuOptions,
  menuOptionsUrl,
  ReorderMenuOptionsParams,
  ReorderOptionChoicesParams,
  UpdateMenuOptionParams,
  UpdateOptionChoiceParams,
} from "./httpMenuOption";
import { isOptionOrderMismatch } from "./httpMenuOptionErrors";

type MenuOptionMutationOptions = {
  onReorderError?: (error: HttpAxiosError) => void;
};

type WithMenuId<Params> = Omit<Params, "storeId"> & { menuId: string };

type OptionsSnapshot = { menuId: string; previousOptions?: MenuOptionGroup[] };

/** choices는 항상 부모 옵션 안에 실려 내려오기 때문에 선택지 변경도 같은 키를 무효화한다:  */
export default function useMenuOptionMutation(
  storeId: string,
  { onReorderError }: MenuOptionMutationOptions = {}
) {
  const queryClient = useQueryClient();
  const optionsQueryKey = (menuId: string) =>
    makeQueryKey(menuOptionsUrl(storeId, menuId));

  const invalidateOptions = (menuId: string) =>
    queryClient.invalidateQueries({ queryKey: optionsQueryKey(menuId) });

  /** 재정렬만 낙관적으로 반영한다 — 드래그가 원래 자리로 튀는 걸 막는 게 목적이다. */
  const applyOptimisticOptions = async (
    menuId: string,
    update: (options: MenuOptionGroup[]) => MenuOptionGroup[]
  ): Promise<OptionsSnapshot> => {
    await queryClient.cancelQueries({ queryKey: optionsQueryKey(menuId) });

    const previousOptions = queryClient.getQueryData<MenuOptionGroup[]>(
      optionsQueryKey(menuId)
    );
    if (previousOptions) {
      queryClient.setQueryData(
        optionsQueryKey(menuId),
        update(previousOptions)
      );
    }

    return { menuId, previousOptions };
  };

  const rollbackOptions = (context?: OptionsSnapshot) => {
    if (!context?.previousOptions) return;

    queryClient.setQueryData(
      optionsQueryKey(context.menuId),
      context.previousOptions
    );
  };

  const createOption = useMutation({
    mutationFn: (args: WithMenuId<CreateMenuOptionParams>) =>
      httpMenuOptions.createMenuOption({ storeId, ...args }),
    onSuccess: (_option, { menuId }) => invalidateOptions(menuId),
  });

  const updateOption = useMutation({
    mutationFn: ({
      menuId: _menuId,
      ...args
    }: WithMenuId<UpdateMenuOptionParams>) =>
      httpMenuOptions.updateMenuOption({ storeId, ...args }),
    onSuccess: (_option, { menuId }) => invalidateOptions(menuId),
  });

  const deleteOption = useMutation({
    mutationFn: ({
      menuId: _menuId,
      ...args
    }: WithMenuId<DeleteMenuOptionParams>) =>
      httpMenuOptions.deleteMenuOption({ storeId, ...args }),
    // 삭제는 이 옵션을 조건으로 삼던 다른 옵션의 트리거까지 서버가 정리하므로 전체를 다시 받는다.
    onSuccess: (_result, { menuId }) => invalidateOptions(menuId),
  });

  const reorderOptions = useMutation({
    mutationFn: (args: WithMenuId<ReorderMenuOptionsParams>) =>
      httpMenuOptions.reorderMenuOptions({ storeId, ...args }),
    onMutate: ({ menuId, reorderMenuOptionsPayload }) =>
      applyOptimisticOptions(menuId, (options) => {
        const optionByPublicId = new Map(
          options.map((option) => [option.publicId, option])
        );
        return reorderMenuOptionsPayload.optionIds
          .map((publicId) => optionByPublicId.get(publicId))
          .filter((option) => option !== undefined);
      }),
    onError: (error, _variables, context) => {
      rollbackOptions(context);
      if (isOptionOrderMismatch(error)) onReorderError?.(error);
    },
    // 집합 불일치(409)로 거절될 수 있으므로 실패해도 진짜 순서를 다시 가져온다.
    onSettled: (_options, _error, { menuId }) => invalidateOptions(menuId),
  });

  const createChoice = useMutation({
    mutationFn: ({
      menuId: _menuId,
      ...args
    }: WithMenuId<CreateOptionChoiceParams>) =>
      httpMenuOptions.createOptionChoice({ storeId, ...args }),
    onSuccess: (_choice, { menuId }) => invalidateOptions(menuId),
  });

  const updateChoice = useMutation({
    mutationFn: ({
      menuId: _menuId,
      ...args
    }: WithMenuId<UpdateOptionChoiceParams>) =>
      httpMenuOptions.updateOptionChoice({ storeId, ...args }),
    onSuccess: (_choice, { menuId }) => invalidateOptions(menuId),
  });

  const deleteChoice = useMutation({
    mutationFn: ({
      menuId: _menuId,
      ...args
    }: WithMenuId<DeleteOptionChoiceParams>) =>
      httpMenuOptions.deleteOptionChoice({ storeId, ...args }),
    onSuccess: (_result, { menuId }) => invalidateOptions(menuId),
  });

  const reorderChoices = useMutation({
    mutationFn: ({
      menuId: _menuId,
      ...args
    }: WithMenuId<ReorderOptionChoicesParams>) =>
      httpMenuOptions.reorderOptionChoices({ storeId, ...args }),
    onMutate: ({ menuId, optionId, reorderOptionChoicesPayload }) =>
      applyOptimisticOptions(menuId, (options) =>
        options.map((option) => {
          if (option.publicId !== optionId) return option;

          const choiceByPublicId = new Map(
            option.choices.map((choice) => [choice.publicId, choice])
          );
          return {
            ...option,
            choices: reorderOptionChoicesPayload.choiceIds
              .map((publicId) => choiceByPublicId.get(publicId))
              .filter((choice) => choice !== undefined),
          };
        })
      ),
    onError: (error, _variables, context) => {
      rollbackOptions(context);
      if (isOptionOrderMismatch(error)) onReorderError?.(error);
    },
    onSettled: (_choices, _error, { menuId }) => invalidateOptions(menuId),
  });

  return {
    createOption,
    updateOption,
    deleteOption,
    reorderOptions,
    createChoice,
    updateChoice,
    deleteChoice,
    reorderChoices,
    invalidateOptions,
  };
}
