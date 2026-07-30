"use client";

import { cn } from "@ssurak/ui/lib/utils";
import RenamingRow from "../../../components/form/category-form/RenamingRow";
import ReorderForm from "../../../components/form/reorder-form-field/ReorderForm";
import { SelectFromChildrenProps } from "../../../components/form/select-form-field/SelectFormField";
import CategoryReorderControl from "./CategoryReorderControl";
import { useState } from "react";
import CreateRowButton from "../../../components/form/category-form/CreateRowButton";
import ReorderController from "./ReorderController";

export default function CategoryFormController({
  registerCommit,
  selectedValue,
  clearSelection,
}: SelectFromChildrenProps) {
  const [isCreateRow, setIsCreateRow] = useState(false);
  const [renamingCategoryId, setRenamingCategoryId] = useState<string | null>(
    null
  );

  return (
    <CategoryReorderControl
      renamingCategoryId={renamingCategoryId}
      registerCommit={registerCommit}
    >
      {({ rows, onReorder, deleteRow, createRow, renameRow, resolver }) => (
        <ReorderForm
          reorderRow={rows}
          onReorder={onReorder}
          renderCreateRow={
            <div
              className={cn(
                "flex justify-between h-14 bg-background transition-[height] duration-200",
                { "h-22": isCreateRow }
              )}
            >
              {isCreateRow ? (
                <div className="flex w-full px-2 py-4 justify-between h-22 bg-background">
                  <RenamingRow
                    resolver={resolver}
                    updateRename={(newName) => {
                      createRow(newName);
                      setIsCreateRow(false);
                    }}
                    closeRenamingRow={() => setIsCreateRow(false)}
                  />
                </div>
              ) : (
                <CreateRowButton onClick={() => setIsCreateRow(true)}>
                  + 새 카테고리 만들기
                </CreateRowButton>
              )}
            </div>
          }
        >
          {({ index, row, getHandleProps }) => {
            return renamingCategoryId === row.id ? (
              <RenamingRow
                defaultName={row.name}
                resolver={resolver}
                updateRename={(newName) => {
                  renameRow(row.id, newName);
                  setRenamingCategoryId(null);
                }}
                closeRenamingRow={() => setRenamingCategoryId(null)}
              />
            ) : (
              <ReorderController
                index={index}
                row={row}
                deleteRow={(categoryId, name) =>
                  deleteRow(categoryId, name, () => {
                    /**
                     * 선택 중인 카테고리를 지우면 폼에는 사라진 publicId가 남는다. 그대로
                     * 제출하면 서버가 404로 거절하므로, 선택을 비워 "카테고리를 선택해
                     * 주세요" 검증에 걸리게 한다. 삭제가 성공했을 때만 비워야 한다.
                     */
                    if (selectedValue === categoryId) clearSelection();
                  })
                }
                onStartRename={() => setRenamingCategoryId(row.id)}
                getHandleProps={getHandleProps}
              />
            );
          }}
        </ReorderForm>
      )}
    </CategoryReorderControl>
  );
}
