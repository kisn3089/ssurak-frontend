"use client";

import { HttpAxiosError } from "@ssurak/api/core/axios/http";
import { toast } from "@ssurak/ui/components/sonner";
import {
  DeleteTableParams,
  Mutation,
  TableAction,
  TableActionsContext,
  ToggleTableActivateParams,
} from "./useTableActionsContext";
import { activatePrefix } from "./activate-badge.const";

export const tableActionToastId = {
  activate: (prefix: string, publicId: string) =>
    `${prefix}-activate-${publicId}`,
  delete: (prefix: string, publicId: string) => `${prefix}-delete-${publicId}`,
  restore: (prefix: string, publicId: string) =>
    `${prefix}-restore-${publicId}`,
};

const promiseToastTile = {
  loading: (name: string, prefix: string, isActive: boolean) =>
    `${name} ${prefix} ${activatePrefix(isActive)}활성화 중...`,
  success: (name: string, prefix: string, isActive: boolean) =>
    `${name} ${prefix} ${activatePrefix(isActive)}활성화되었습니다.`,
  error: (name: string, prefix: string, isActive: boolean) =>
    `${name} ${prefix} ${activatePrefix(isActive)}활성화에 실패했습니다.`,
};

/** 실패 토스트 설명 문구: 엔티티별 백엔드 오류 매핑(httpTableErrors, httpMenuErrors 등)을 주입받는다. */
export type ActionHttpErrors = {
  patch: (error: HttpAxiosError) => string;
  delete: (error: HttpAxiosError) => string;
};

type TableActionsProviderProps = {
  children: React.ReactNode;
  mutation: Mutation;
  toastPrefix: string;
  httpErrors: ActionHttpErrors;
};

export default function TableActionsProvider({
  children,
  mutation,
  toastPrefix,
  httpErrors,
}: TableActionsProviderProps) {
  const { updateActivate, deleteAction } = mutation;

  const toggleActivateOnBackground = async ({
    isActive,
    name,
    publicId,
  }: ToggleTableActivateParams) => {
    const updateTablePromise = updateActivate(publicId, !isActive);

    toast.promise(updateTablePromise, {
      id: tableActionToastId.activate(toastPrefix, publicId),
      loading: promiseToastTile.loading(name, toastPrefix, isActive),
      success: promiseToastTile.success(name, toastPrefix, isActive),
      error: (error: HttpAxiosError) => ({
        message: promiseToastTile.error(name, toastPrefix, isActive),
        description: httpErrors.patch(error),
        duration: Infinity,
        closeButton: true,
        action: {
          label: "재시도",
          onClick: () =>
            toggleActivateOnBackground({ isActive, name, publicId }),
        },
      }),
      position: "top-center",
    });
  };

  const deleteTableOnBackground = async ({
    name,
    publicId,
  }: DeleteTableParams) => {
    const deleteTablePromise = deleteAction(publicId);

    toast.promise(deleteTablePromise, {
      id: tableActionToastId.delete(toastPrefix, publicId),
      loading: `${name} ${toastPrefix} 삭제 중...`,
      success: `${name} ${toastPrefix} 삭제되었습니다.`,
      error: (error: HttpAxiosError) => ({
        message: `${name} ${toastPrefix} 삭제에 실패했습니다.`,
        description: httpErrors.delete(error),
        duration: Infinity,
        closeButton: true,
        action: {
          label: "재시도",
          onClick: () => deleteTableOnBackground({ name, publicId }),
        },
      }),
      position: "top-center",
    });
  };

  const tableActions: TableAction = {
    toggleActivateOnBackground,
    deleteTableOnBackground,
  };

  return (
    <TableActionsContext.Provider value={tableActions}>
      {children}
    </TableActionsContext.Provider>
  );
}
