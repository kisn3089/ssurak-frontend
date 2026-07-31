import { httpCategoryErrors } from "@ssurak/api/core/store/category/httpCategoryErrors";
import notifyFailure from "../utils/notifyFailure";
import useCategoryMutation from "@ssurak/api/core/store/category/useCategoryMutation";
import { useParams } from "next/navigation";

export default function useCategoryMutations() {
  const { storeId } = useParams<{ storeId: string }>();

  const { createCategory, deleteCategory, updateCategory, reorderCategories } =
    useCategoryMutation(storeId, {
      onReorderError: (error) =>
        notifyFailure(
          "카테고리 순서를 저장하지 못했어요.",
          httpCategoryErrors.reorder(error)
        ),
    });

  const { mutate: reorderCategoriesMutate } = reorderCategories;

  const createRow = (name: string) =>
    createCategory.mutate(
      { createCategoryPayload: { name } },
      {
        onError: (error) =>
          notifyFailure(
            "카테고리를 추가하지 못했어요.",
            httpCategoryErrors.post(error),
            () => createRow(name)
          ),
      }
    );

  const renameRow = (categoryId: string, name: string) =>
    updateCategory.mutate(
      { categoryId, updateCategoryPayload: { name } },
      {
        onError: (error) =>
          notifyFailure(
            "카테고리 이름을 변경하지 못했어요.",
            httpCategoryErrors.patch(error),
            () => renameRow(categoryId, name)
          ),
      }
    );

  const deleteRow = (
    categoryId: string,
    name: string,
    onSuccess?: () => void
  ) =>
    deleteCategory.mutate(
      { categoryId },
      {
        onSuccess,
        onError: (error) =>
          notifyFailure(
            `'${name}' 카테고리를 삭제하지 못했어요.`,
            httpCategoryErrors.delete(error),
            () => deleteRow(categoryId, name, onSuccess)
          ),
      }
    );

  return { reorderCategoriesMutate, createRow, renameRow, deleteRow };
}
