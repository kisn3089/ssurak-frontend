export const BADGE_BY_ORDER_STATUS = {
  PENDING: {
    label: "주문 요청",
    badgeVariant: "destructive",
  },
  ACCEPTED: {
    label: "주문 수락",
    badgeVariant: "default",
  },
  PREPARING: {
    label: "준비중",
    badgeVariant: "hilight",
  },
  COMPLETED: {
    label: "서빙 완료",
    badgeVariant: "outline",
  },
  CANCELLED: {
    label: "주문 취소",
    badgeVariant: "outline",
  },
} as const;
