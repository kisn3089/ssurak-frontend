import { httpMenuOptionErrors } from "@ssurak/api/core/store/menu/option/httpMenuOptionErrors";
import useMenuOptionMutation from "@ssurak/api/core/store/menu/option/useMenuOptionMutation";
import {
  CreateMenuOptionPayload,
  UpdateMenuOptionPayload,
} from "@ssurak/api/schemas/model/menuOption.schema";
import { toast } from "@ssurak/ui/components/sonner";
import useSaveChoices from "./useSaveChoices";
import { MenuOptionGroup } from "@ssurak/api/types/menu/menuOptions.interface";
import { OptionGroupForm } from "../types/option-form.type";

export default function useBuildOptionMutateCallback(
  storeId: string,
  menuId: string
) {
  const mutations = useMenuOptionMutation(storeId, {
    onReorderError: (error) => toast.error(httpMenuOptionErrors.reorder(error)),
  });

  const createOption = async (payload: CreateMenuOptionPayload) => {
    await mutations.createOption.mutateAsync({
      menuId,
      createMenuOptionPayload: payload,
    });
  };

  const saveChoices = useSaveChoices(storeId, menuId);

  const updateOption = async (
    option: MenuOptionGroup,
    payload: UpdateMenuOptionPayload,
    values: OptionGroupForm
  ) => {
    await mutations.updateOption.mutateAsync({
      menuId,
      optionId: option.publicId,
      updateMenuOptionPayload: payload,
    });

    return await saveChoices(option, values);
  };

  const deleteOption = async (optionId: string) => {
    await mutations.deleteOption.mutateAsync({ menuId, optionId });
  };

  const invalidateOptions = async () => {
    await mutations.invalidateOptions(menuId);
  };

  return {
    mutations,
    createOption,
    updateOption,
    deleteOption,
    invalidateOptions,
  };
}
