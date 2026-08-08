import { CartItem } from "@ssurak/api/types/cart/cart.interface";
import { toSnapshotLines } from "@ssurak/ui/utils/menu/optionSnapshot";

/**
 * 장바구니 항목의 옵션.
 * 서버가 이름·금액까지 담긴 스냅샷을 내려주므로 메뉴를 다시 조회하지 않는다.
 */
export default function CartMenuOptions({
  options,
}: {
  options: CartItem["options"];
}) {
  const lines = toSnapshotLines(options);
  if (lines.length === 0) return null;

  return (
    <div className="pt-2">
      {lines.map((line) => (
        <div key={line.optionId} className="flex gap-x-2 text-sm">
          <p className="font-semibold text-black">{line.name}</p>
          <p className="text-muted-foreground">{line.value}</p>
        </div>
      ))}
    </div>
  );
}
