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
  isRenderChild,
  setIsRenderChild,
  registerCommit,
}: SelectFromChildrenProps) {
  const [isCreateRow, setIsCreateRow] = useState(false);

  return (
    <CategoryReorderControl
      isRenderChild={isRenderChild}
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
            return isRenderChild === index ? (
              <RenamingRow
                defaultName={row.name}
                resolver={resolver}
                updateRename={(newName) => {
                  renameRow(row.id, newName);
                  setIsRenderChild(-1);
                }}
                closeRenamingRow={() => setIsRenderChild(-1)}
              />
            ) : (
              <ReorderController
                index={index}
                row={row}
                deleteRow={deleteRow}
                setIsRenderChild={setIsRenderChild}
                getHandleProps={getHandleProps}
              />
            );
          }}
        </ReorderForm>
      )}
    </CategoryReorderControl>
  );
}
