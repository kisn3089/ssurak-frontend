"use client";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  collectExistingMenuNames,
  countBlockedItems,
  deriveDuplicateFlags,
  DraftReviewFormValues,
  toBulkPayloadItems,
} from "../utils/draft-review";
import { useParams, useRouter } from "next/navigation";
import DraftItemRow from "./DraftItemRow";
import AddFieldButton from "../../../components/form/AddFieldButton";
import { createEmptyMenuItem } from "../utils/bulk-menu-form";
import useSuspenseWithAuth from "@ssurak/api/hooks/useSuspenseWithAuth";
import { CategoryWithMenusResponse } from "@ssurak/api/types/category/category.interface";
import SyncDraftControlbar from "./SyncDraftControlbar";
import BulkMenuFormFooter from "./BulkMenuFormFooter";
import { cn } from "@ssurak/ui/lib/utils";
import useSyncServerDraftEffect from "../hooks/useSyncServerDraftEffect";
import useMenuMutation from "@ssurak/api/core/store/menu/useMenuMutation";
import { toast } from "@ssurak/ui/components/sonner";
import { httpMenuErrors } from "@ssurak/api/core/store/menu/httpMenuErrors";
import DraftSummaryWithThumbnails from "../../import/components/draft/DraftSummaryWithThumbnails";
import useLocalStorage from "@ssurak/ui/hooks/useLocalStorage";
import { localDraftKey } from "../hooks/useDraftAutosave";

export const DEFAULT_FORM_VALUES: DraftReviewFormValues = { items: [] };

export default function BulkCreateMenuForm() {
  const { storeId } = useParams<{ storeId: string }>();
  const router = useRouter();

  const { data: categoryWithMenuList } = useSuspenseWithAuth<
    CategoryWithMenusResponse[]
  >(`/stores/v1/${storeId}/menus`);

  const { control, register, setValue, reset } = useForm<DraftReviewFormValues>(
    {
      defaultValues: DEFAULT_FORM_VALUES,
    }
  );
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = useWatch({ control, name: "items" });

  const { data: draft, isLoading } = useSyncServerDraftEffect(reset);

  const categories = categoryWithMenuList.map((category) => ({
    publicId: category.publicId,
    name: category.name,
  }));
  const existingMenuNames = collectExistingMenuNames(categoryWithMenuList);

  const duplicateFlags = deriveDuplicateFlags({ items, existingMenuNames });

  const bulkItems = toBulkPayloadItems(items);
  const blockedCount = countBlockedItems(items);

  const { bulkCreateMenus } = useMenuMutation(storeId);

  const [_localDraft, _setLocalDraft, clearLocalDraft] = useLocalStorage(
    localDraftKey(storeId),
    { fallback: DEFAULT_FORM_VALUES, parse: () => undefined }
  );

  const commitMenus = () =>
    bulkCreateMenus.mutate(
      { bulkCreateMenusPayload: { items: bulkItems } },
      {
        onSuccess: (created) => {
          toast.success(`메뉴 ${created.length}개를 등록했어요.`);
          if (!draft) clearLocalDraft();
          router.push(`/${storeId}/menus`);
        },
        onError: (error) => toast.error(httpMenuErrors.bulk(error)),
      }
    );

  return (
    <div>
      <DraftSummaryWithThumbnails draft={draft} isLoading={isLoading} />
      <SyncDraftControlbar
        items={items}
        reset={reset}
        hasServerDraft={!!draft}
      />
      <ul className="mt-4 flex flex-col gap-2">
        {fields.map((field, index) => (
          <DraftItemRow
            key={field.id}
            index={index}
            control={control}
            register={register}
            setValue={setValue}
            categories={categories}
            isDuplicate={duplicateFlags[index]}
            remove={remove}
          />
        ))}
      </ul>
      <AddFieldButton
        onClick={() => append(createEmptyMenuItem())}
        className={cn("mt-2 h-11", { "mt-6": fields.length !== 0 })}
      >
        메뉴 추가
      </AddFieldButton>
      <BulkMenuFormFooter
        registrableCount={bulkItems.length}
        blockedCount={blockedCount}
        isCommitting={bulkCreateMenus.isPending}
        onCommit={commitMenus}
      />
    </div>
  );
}
