import { useRef, useState } from "react";

/** 클릭과 드래그를 가르는 이동 거리(px) */
const DRAG_THRESHOLD = 4;

/** 이만큼만 남으면 오른쪽 끝에 닿은 것으로 봅니다(소수점 오차 흡수). */
const END_TOLERANCE = 1;

/**
 * 오른쪽 끝을 한 번 찍은 뒤 왼쪽으로 되돌릴 때 적용하는 저항.
 * 손이 움직인 거리의 이 비율만큼만 따라가므로, 끝에 붙어 있던 관성을 이겨내는 느낌이 납니다.
 */
const REVERSE_RESISTANCE = 0.5;

/** 손을 뗐을 때 제자리로 돌아가는 전환 */
const RELEASE_TRANSITION = "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)";

type DragStart = {
  pointerX: number;
  /** 드래그를 시작한 시점의 이동량. 끝에 붙은 채로 다시 잡을 수 있어 0이 아닐 수 있습니다. */
  offsetX: number;
  maxOffsetX: number;
};

type UseDragToConfirmParams = {
  /** 오른쪽 끝에 닿은 상태에서 포인터를 떼면 호출됩니다. */
  onConfirm: () => void;
  /** 꺼져 있으면 포인터 이벤트를 흘려보냅니다(평범한 버튼처럼 동작). */
  enabled: boolean;
};

/**
 * 트랙 오른쪽 끝까지 끌어야 확정되는 "밀어서 실행" 제스처.
 *
 * 트랙(`trackRef`)의 안쪽 너비에서 손잡이 너비를 뺀 만큼이 이동 가능 거리이고,
 * 포인터를 뗀 위치가 그 끝이면 `onConfirm`이 나갑니다. 끝을 한 번 찍은 뒤에는
 * 되돌아오는 방향에만 저항이 걸려, 스치듯 지나가도 곧바로 취소되지는 않습니다.
 */
export default function useDragToConfirm<Thumb extends HTMLElement>({
  onConfirm,
  enabled,
}: UseDragToConfirmParams) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<Thumb>(null);
  const startRef = useRef<DragStart | null>(null);
  const offsetRef = useRef(0);
  const reachedEndRef = useRef(false);
  /** 임계값을 넘겨 실제로 끌었는지. 드래그 뒤에 따라오는 click을 걸러내는 데 씁니다. */
  const movedRef = useRef(false);

  const [offsetX, setOffsetX] = useState(0);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const updateOffsetX = (next: number) => {
    offsetRef.current = next;
    setOffsetX(next);
  };

  const updateReachedEnd = (next: boolean) => {
    reachedEndRef.current = next;
    setHasReachedEnd(next);
  };

  /** 트랙 안에서 손잡이가 움직일 수 있는 거리. 패딩 안쪽만 씁니다. */
  const measureMaxOffsetX = () => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return 0;

    const { paddingLeft, paddingRight } = getComputedStyle(track);
    const innerWidth =
      track.clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight);

    return Math.max(innerWidth - thumb.offsetWidth, 0);
  };

  const resolveOffsetX = (rawX: number, maxOffsetX: number) => {
    if (rawX >= maxOffsetX) {
      updateReachedEnd(true);
      return maxOffsetX;
    }
    if (reachedEndRef.current) {
      return Math.max(maxOffsetX - (maxOffsetX - rawX) * REVERSE_RESISTANCE, 0);
    }
    return Math.max(rawX, 0);
  };

  const endDrag = () => {
    startRef.current = null;
    setIsDragging(false);
    updateReachedEnd(false);
    updateOffsetX(0);
  };

  const handleProps = {
    onPointerDown: (e: React.PointerEvent<Thumb>) => {
      if (!enabled || e.button !== 0) return;
      // 드래그 중 텍스트 선택과 스크롤 제스처를 막습니다.
      // 기본 동작인 포커스 이동까지 막히므로 직접 포커스를 옮깁니다.
      e.preventDefault();
      e.currentTarget.focus();
      e.currentTarget.setPointerCapture(e.pointerId);

      movedRef.current = false;
      startRef.current = {
        pointerX: e.clientX,
        offsetX: offsetRef.current,
        maxOffsetX: measureMaxOffsetX(),
      };
      setIsDragging(true);
    },
    onPointerMove: (e: React.PointerEvent<Thumb>) => {
      const start = startRef.current;
      if (!start) return;

      const movedX = e.clientX - start.pointerX;
      if (!movedRef.current && Math.abs(movedX) < DRAG_THRESHOLD) return;
      movedRef.current = true;

      updateOffsetX(resolveOffsetX(start.offsetX + movedX, start.maxOffsetX));
    },
    onPointerUp: (e: React.PointerEvent<Thumb>) => {
      const start = startRef.current;
      if (!start) return;

      e.currentTarget.releasePointerCapture(e.pointerId);
      const isConfirmed =
        start.maxOffsetX > 0 &&
        offsetRef.current >= start.maxOffsetX - END_TOLERANCE;

      endDrag();
      if (isConfirmed) onConfirm();
    },
    onPointerCancel: endDrag,
  };

  /**
   * 드래그가 끝나면 브라우저가 click까지 이어서 쏩니다.
   * 그 click을 삼켜야 "끌었을 뿐인데 눌린" 동작이 생기지 않습니다.
   */
  const shouldIgnoreClick = () => {
    if (!movedRef.current) return false;
    movedRef.current = false;
    return true;
  };

  return {
    trackRef,
    hasReachedEnd,
    isDragging,
    shouldIgnoreClick,
    thumbProps: {
      ref: thumbRef,
      style: {
        transform: `translateX(${offsetX}px)`,
        // 끄는 동안에는 손을 그대로 따라가야 하고, 놓은 뒤에만 미끄러지듯 돌아옵니다.
        transition: isDragging ? "none" : RELEASE_TRANSITION,
        touchAction: enabled ? ("none" as const) : undefined,
      },
      ...handleProps,
    },
  };
}
