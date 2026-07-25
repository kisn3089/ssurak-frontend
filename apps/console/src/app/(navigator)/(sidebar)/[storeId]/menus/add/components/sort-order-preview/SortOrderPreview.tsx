import { Menu } from "@ssurak/api/types/menu/menu.interface";
import { buildRows, PreviewRow } from "./build-rows";
import OutOfWindowMessage from "./OutOfWindowMessage";
import SortNumber from "./SortNumber";
import SortMenuName from "./SortMenuName";
import HighlightLabel from "./HighlightLabel";
import SortLayout from "./SortLayout";

const MAX_VISIBLE = 5;

type SortOrderPreviewProps = {
  categoryName: string;
  rows: PreviewRow[];
};

export default function SortOrderPreview({
  categoryName,
  rows,
}: SortOrderPreviewProps) {
  const newIndex = rows.findIndex((row) => row.isNew);
  const half = Math.floor(MAX_VISIBLE / 2);
  let start = Math.max(0, newIndex - half);
  let end = start + MAX_VISIBLE;
  if (end > rows.length) {
    end = rows.length;
    start = Math.max(0, end - MAX_VISIBLE);
  }
  const visibleRows = rows.slice(start, end);

  return (
    <div className="rounded-3xl border bg-background shadow-sm">
      <h3 className="px-4 py-3 font-bold border-b">{categoryName}</h3>
      <div className="px-2">
        <OutOfWindowMessage hiddenBefore={start} />
        <ul className="flex flex-col py-3">
          {visibleRows.map((row) => (
            <SortLayout isNew={row.isNew} key={row.key}>
              <SortNumber sortOrder={row.sortOrder} isNew={row.isNew} />
              <SortMenuName name={row.name} isNew={row.isNew} />
              <HighlightLabel isNew={row.isNew} />
            </SortLayout>
          ))}
        </ul>
        <OutOfWindowMessage hiddenAfter={rows.length - end} />
      </div>
    </div>
  );
}
