import { Menu } from "@ssurak/api/types/menu/menu.interface";
import { useParams } from "next/navigation";
import useToasting from "../../../hooks/useToasting";
import useMenuMutation from "@ssurak/api/core/store/menu/useMenuMutation";
import { ToggleTableActivateParams } from "../../../components/table-view/table/useTableActionsContext";
import { toast } from "@ssurak/ui/components/sonner";
import { tableActionToastId } from "../../../components/table-view/table/TableActionsProvider";
import { HttpAxiosError } from "@ssurak/api/core/axios/http";
import { httpMenuErrors } from "@ssurak/api/core/store/menu/httpMenuErrors";
import useMinuteTick from "@ssurak/ui/hooks/useMinuteTick";
import TableInfoRow from "../../../components/table-view/table/TableInfoRow";
import UnderlineLink from "../../../components/table-view/table/UnderlineLink";
import { transCurrencyFormat } from "@ssurak/ui/utils/menu/priceFormatter";
import { Progress } from "@ssurak/ui/components/progress";
import { formatRemaining, remainingRatio } from "@ssurak/ui/utils/date-format";
import { Button } from "@ssurak/ui/components/buttons/button";

const RESTORE_TTL_MS = 3 * 24 * 60 * 60 * 1_000;

const RESTORE_TOAST_TITLE = {
  loading: (name: string) => `${name} 메뉴 복구 중...`,
  success: (name: string) => `${name} 메뉴가 복구되었습니다.`,
  error: (name: string) => `${name} 메뉴 복구에 실패했습니다.`,
};

export default function DeletedMenuListView({
  deletedMenuList,
}: {
  deletedMenuList: Menu[];
}) {
  const { storeId } = useParams<{ storeId: string }>();
  const { isActioning } = useToasting();

  const { restoreMenu } = useMenuMutation(storeId);

  const restoreOnBackground = async ({
    name,
    publicId,
  }: Omit<ToggleTableActivateParams, "isActive">) => {
    const updateTablePromise = restoreMenu.mutateAsync({ menuId: publicId });

    toast.promise(updateTablePromise, {
      id: tableActionToastId.restore("menu", publicId),
      loading: RESTORE_TOAST_TITLE.loading(name),
      success: RESTORE_TOAST_TITLE.success(name),
      error: (error: HttpAxiosError) => ({
        message: RESTORE_TOAST_TITLE.error(name),
        description: httpMenuErrors.restore(error),
        duration: Infinity,
        closeButton: true,
        action: {
          label: "재시도",
          onClick: () => restoreOnBackground({ name, publicId }),
        },
      }),
      position: "top-center",
    });
  };

  const now = useMinuteTick() ?? 100;

  return (
    <>
      {deletedMenuList.map((menu) => {
        const isAction = isActioning([
          tableActionToastId.restore("menu", menu.publicId),
        ]);

        const isExpiredSoon = new Date(
          new Date(menu.deletedAt ?? new Date()).getTime() + RESTORE_TTL_MS
        ).toISOString();

        return (
          <tr
            className={`font-semibold text-sm border-b last:border-b-0 ${isAction ? "opacity-50 pointer-events-none" : ""}`}
            aria-disabled={isAction}
            key={menu.publicId}
          >
            <TableInfoRow className="line-clamp-1">
              <UnderlineLink href={`menus/${menu.publicId}`}>
                {menu.name}
              </UnderlineLink>
            </TableInfoRow>
            <TableInfoRow className="line-clamp-1">
              {transCurrencyFormat(menu.price)}
            </TableInfoRow>
            <TableInfoRow className="line-clamp-1">
              {menu.deletedAt && (
                <>
                  <Progress
                    value={remainingRatio(isExpiredSoon, RESTORE_TTL_MS, now)}
                    className={"h-1.5"}
                  />
                  <span className="text-muted-foreground lg:text-sm text-xs">{`${formatRemaining(isExpiredSoon, now)}삭제`}</span>
                </>
              )}
            </TableInfoRow>
            <TableInfoRow className="w-fit ml-auto">
              <Button
                type="button"
                className="rounded-3xl font-bold"
                onClick={() =>
                  restoreOnBackground({
                    name: menu.name,
                    publicId: menu.publicId,
                  })
                }
              >
                복구
              </Button>
            </TableInfoRow>
          </tr>
        );
      })}
    </>
  );
}
