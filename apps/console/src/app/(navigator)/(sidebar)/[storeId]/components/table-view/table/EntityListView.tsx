"use client";

import TableActionsProvider, {
  ActionHttpErrors,
  tableActionToastId,
} from "./TableActionsProvider";
import TableActions from "./TableActions";
import TableInfoRow from "./TableInfoRow";
import UnderlineLink from "./UnderlineLink";
import { activeBadge } from "./activate-badge.const";
import { Mutation } from "./useTableActionsContext";
import useToasting from "../../../hooks/useToasting";

export interface RowCell {
  content: React.ReactNode;
  className?: string;
  overwriteOverflow?: string;
}

/** 이름(링크)·활성 배지·액션 컬럼은 공통 셸이 렌더링하고, `cells`는 그 사이의 중간 컬럼들만 담는다. */
export interface EntityRow {
  publicId: string;
  isActive: boolean;
  name: string;
  cells: RowCell[];
}

interface EntityListViewProps<T> {
  list: T[];
  toRow: (item: T) => EntityRow;
  hrefPrefix: string;
  toastPrefix: string;
  mutation: Mutation;
  httpErrors: ActionHttpErrors;
  activeBadge: ReturnType<typeof activeBadge>;
}

export default function EntityListView<T>({
  list,
  toRow,
  hrefPrefix,
  toastPrefix,
  mutation,
  httpErrors,
  activeBadge,
}: EntityListViewProps<T>) {
  const { isActioning } = useToasting();

  return (
    <TableActionsProvider
      mutation={mutation}
      toastPrefix={toastPrefix}
      httpErrors={httpErrors}
    >
      {list.map((item) => {
        const { publicId, isActive, name, cells } = toRow(item);

        const isAction = isActioning([
          tableActionToastId.activate(toastPrefix, publicId),
          tableActionToastId.delete(toastPrefix, publicId),
        ]);

        const metaInfoForAction = { publicId, isActive, name };

        return (
          <tr
            className={`font-semibold text-sm border-b last:border-b-0 ${isAction ? "opacity-50 pointer-events-none" : ""}`}
            aria-disabled={isAction}
            key={publicId}
          >
            <TableInfoRow className="line-clamp-1">
              <UnderlineLink href={`${hrefPrefix}/${publicId}`}>
                {name}
              </UnderlineLink>
            </TableInfoRow>
            {cells.map((cell, index) => (
              <TableInfoRow
                key={index}
                className={cell.className}
                overwriteOverflow={cell.overwriteOverflow}
              >
                {cell.content}
              </TableInfoRow>
            ))}
            <TableInfoRow>
              {activeBadge[isActive ? "active" : "inactive"]}
            </TableInfoRow>
            <TableInfoRow className="w-fit ml-auto">
              <TableActions
                metaInfoForAction={metaInfoForAction}
                editHref={`${hrefPrefix}/${publicId}/edit`}
              />
            </TableInfoRow>
          </tr>
        );
      })}
    </TableActionsProvider>
  );
}
