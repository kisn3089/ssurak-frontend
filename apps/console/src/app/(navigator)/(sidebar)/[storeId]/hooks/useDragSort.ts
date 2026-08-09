import { useRef, useState } from "react";

/** 클릭과 드래그를 가르는 이동 거리(px) */
const DRAG_THRESHOLD = 4;

/**
 * 이웃 행을 높이의 이 비율만큼 침범하면 자리바꿈을 확정합니다.
 * 0.5 는 중앙선까지 끌어야 하는 것이고, 낮출수록 적게 움직여도 순서가 바뀝니다.
 */
const COMMIT_RATIO = 0.25;

const DRAG_ITEM_ATTRIBUTE = "data-drag-item";

/** 그립에 포커스가 있을 때 방향키가 옮기는 칸 수 */
const ARROW_STEP: Record<string, number | undefined> = {
  ArrowUp: -1,
  ArrowDown: 1,
};

export type DragHandleProps = {
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
};

export type DragItemProps = {
  [DRAG_ITEM_ATTRIBUTE]: string;
  style?: React.CSSProperties;
};

/** 한 행을 끌 수 있게 만드는 데 필요한 것 전부. 끌 수 없는 행에는 통째로 주지 않는다. */
export type DragRowProps = {
  handleProps: DragHandleProps;
  itemProps: DragItemProps;
  isDragging: boolean;
  /** 끌고 있는 행이 이 행의 어느 쪽으로 들어오는지. 자리바꿈이 확정될 경계선을 그린다. */
  dropEdge: "top" | "bottom" | null;
  /** 자리는 그대로 두고 그립만 잠근다(앞선 재정렬이 아직 서버에 닿지 않았을 때). */
  isDisabled?: boolean;
};

export function resolveDropEdge(
  draggingIndex: number | null,
  targetIndex: number | null,
  index: number
): DragRowProps["dropEdge"] {
  if (draggingIndex === null || targetIndex !== index) return null;
  if (draggingIndex === index) return null;

  return draggingIndex < index ? "bottom" : "top";
}

export function reorder<Item>(items: Item[], from: number, to: number) {
  const moved = items[from];
  if (moved === undefined || from === to) return items;

  const next = [...items];
  next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

type DragState = {
  from: number;
  to: number;
  offsetY: number;
};

type UseDragSortOptions = {
  disabled?: boolean;
};

export default function useDragSort(
  itemCount: number,
  onReorder: (from: number, to: number) => void,
  { disabled = false }: UseDragSortOptions = {}
) {
  const listRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<{ index: number; y: number } | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  const updateDrag = (next: DragState | null) => {
    dragRef.current = next;
    setDrag(next);
  };

  const endDrag = () => {
    startRef.current = null;
    updateDrag(null);
  };

  /**
   * 끌어온 거리를 이동 후 인덱스로 환산합니다.
   *
   * 포인터의 절대 위치를 이웃 행의 중앙선과 비교하면, 그립이 행 중앙에 있는 탓에
   * 한 칸 옮기는 데 행 높이만큼을 온전히 끌어야 합니다. 대신 이동 거리를 기준으로
   * 삼아 이웃 행을 COMMIT_RATIO 만큼만 침범해도 자리바꿈이 확정되게 합니다.
   */
  const resolveTargetIndex = (from: number, offsetY: number) => {
    // 옵션 그룹 목록 안에 선택지 목록이 또 들어앉으므로, 자기 자식 행만 센다.
    const rows = listRef.current?.querySelectorAll<HTMLElement>(
      `:scope > [${DRAG_ITEM_ATTRIBUTE}]`
    );
    if (!rows?.length) return from;

    const step = offsetY > 0 ? 1 : -1;
    let to = from;
    let remaining = Math.abs(offsetY);

    for (
      let index = from + step;
      index >= 0 && index < rows.length;
      index += step
    ) {
      const { height } = rows[index].getBoundingClientRect();
      if (remaining < height * COMMIT_RATIO) break;

      to = index;
      remaining -= height;
    }

    return to;
  };

  const getHandleProps = (index: number): DragHandleProps => ({
    onPointerDown: (e) => {
      if (disabled || e.button !== 0) return;
      // 드래그 중 텍스트 선택과 스크롤 제스처를 막습니다.
      // 기본 동작인 포커스 이동까지 막히므로 직접 포커스를 옮깁니다.
      e.preventDefault();
      e.currentTarget.focus();
      e.currentTarget.setPointerCapture(e.pointerId);
      startRef.current = { index, y: e.clientY };
    },
    onPointerMove: (e) => {
      const start = startRef.current;
      if (!start) return;

      const offsetY = e.clientY - start.y;
      if (!dragRef.current && Math.abs(offsetY) < DRAG_THRESHOLD) return;

      updateDrag({
        from: start.index,
        to: resolveTargetIndex(start.index, offsetY),
        offsetY,
      });
    },
    onPointerUp: (e) => {
      e.currentTarget.releasePointerCapture(e.pointerId);
      const current = dragRef.current;
      endDrag();
      if (current && current.to !== current.from) {
        onReorder(current.from, current.to);
      }
    },
    onPointerCancel: endDrag,
    onKeyDown: (e) => {
      const step = ARROW_STEP[e.key];
      if (disabled || step === undefined) return;

      const to = index + step;
      if (to < 0 || to >= itemCount) return;

      e.preventDefault();
      onReorder(index, to);
    },
  });

  const getItemProps = (index: number): DragItemProps => ({
    [DRAG_ITEM_ATTRIBUTE]: "",
    style:
      drag?.from === index
        ? {
            transform: `translateY(${drag.offsetY}px)`,
            position: "relative",
            zIndex: 10,
          }
        : undefined,
  });

  return {
    listRef,
    draggingIndex: drag?.from ?? null,
    targetIndex: drag?.to ?? null,
    getHandleProps,
    getItemProps,
  };
}
