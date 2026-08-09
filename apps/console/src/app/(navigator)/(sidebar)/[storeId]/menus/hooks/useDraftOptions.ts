import { httpMenuOptionErrors } from "@ssurak/api/core/store/menu/option/httpMenuOptionErrors";
import useMenuOptionMutation from "@ssurak/api/core/store/menu/option/useMenuOptionMutation";
import {
  CreateMenuOptionPayload,
  createMenuOptionPayloadSchema,
} from "@ssurak/api/schemas/model/menuOption.schema";
import { isSameOrder } from "@ssurak/api/utils/reorder";
import { toast } from "@ssurak/ui/components/sonner";
import { isAxiosError } from "axios";
import { OptionPreviewDrafts } from "./useOptionPreviewDrafts";
import {
  hasPreviewContent,
  toCreateOptionPayload,
} from "../utils/option-preview";

/** 아직 서버에 없는 옵션 카드 하나. 화면 순서를 되찾을 수 있도록 draftId를 함께 들고 있는다. */
export type DraftOption = {
  draftId: string;
  payload: CreateMenuOptionPayload;
};

/** 메뉴 생성 화면의 옵션 저장 */
export default function useDraftOptions(storeId: string) {
  const { createOption, reorderOptions } = useMenuOptionMutation(storeId);

  /**
   * 초안 카드의 값을 서버와 같은 스키마로 검증해 생성 페이로드로 바꾼다.
   * 하나라도 어긋나면 null을 돌려준다 — 메뉴부터 만들고 나면 되돌릴 수 없어서,
   * 요청을 보내기 전에 여기서 멈춘다.
   */
  const resolveDraftOptions = (
    draftIds: string[],
    drafts: OptionPreviewDrafts
  ): DraftOption[] | null => {
    const draftOptions: DraftOption[] = [];
    const names = new Set<string>();

    for (const draftId of draftIds) {
      const draft = drafts[draftId];
      // 카드만 열어 두고 손대지 않았다면 없는 것으로 친다(미리보기와 같은 기준).
      if (!draft || !hasPreviewContent(draft)) continue;

      const payload = toCreateOptionPayload(draft);
      const parsed = createMenuOptionPayloadSchema.safeParse(payload);
      if (!parsed.success) {
        toast.error(
          describeDraftIssue(payload.name, parsed.error.issues[0]?.message)
        );
        return null;
      }

      // 이름 중복은 스키마가 알 수 없다 — 같은 메뉴 안에서만 유일하면 된다.
      if (names.has(payload.name)) {
        toast.error(
          describeDraftIssue(payload.name, "이미 있는 옵션 이름입니다.")
        );
        return null;
      }
      names.add(payload.name);

      draftOptions.push({ draftId, payload });
    }

    return draftOptions;
  };

  /**
   * 만들어진 메뉴에 초안 옵션을 올린다.
   * 옵션 저장에 실패해도 메뉴 자체는 이미 만들어졌으므로 예외로 올리지 않고 실패만 알린다.
   */
  const saveDraftOptions = async (
    menuId: string,
    draftOptions: DraftOption[],
    displayOrder: string[]
  ): Promise<{ optionsFailed: boolean }> => {
    const createdIdByDraftId = new Map<string, string>();

    try {
      for (const { draftId, payload } of draftOptions) {
        const created = await createOption.mutateAsync({
          menuId,
          createMenuOptionPayload: payload,
        });
        createdIdByDraftId.set(draftId, created.publicId);
      }
    } catch (error) {
      if (isAxiosError(error)) toast.error(httpMenuOptionErrors.post(error));
      return { optionsFailed: true };
    }

    return await reorderCreatedOptions(
      menuId,
      createdIdByDraftId,
      displayOrder
    );
  };

  const reorderCreatedOptions = async (
    menuId: string,
    createdIdByDraftId: Map<string, string>,
    displayOrder: string[]
  ): Promise<{ optionsFailed: boolean }> => {
    const createdOrder = [...createdIdByDraftId.values()];
    const optionIds = displayOrder.flatMap((draftId) => {
      const publicId = createdIdByDraftId.get(draftId);
      return publicId ? [publicId] : [];
    });

    if (isSameOrder(createdOrder, optionIds)) return { optionsFailed: false };

    try {
      await reorderOptions.mutateAsync({
        menuId,
        reorderMenuOptionsPayload: { optionIds },
      });
      return { optionsFailed: false };
    } catch (error) {
      if (isAxiosError(error)) toast.error(httpMenuOptionErrors.reorder(error));
      return { optionsFailed: true };
    }
  };

  return { resolveDraftOptions, saveDraftOptions };
}

function describeDraftIssue(
  name: string,
  message = "옵션 정보가 올바르지 않아요."
) {
  return name === "" ? message : `${name}: ${message}`;
}
