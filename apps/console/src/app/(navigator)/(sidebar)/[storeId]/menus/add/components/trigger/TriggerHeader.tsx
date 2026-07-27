export default function TriggerHeader() {
  return (
    <>
      <span className="text-blue-primary-foreground text-sm font-bold">
        노출 조건
      </span>
      <span className="text-muted-foreground text-xs">
        조건을 추가하면 다른 그룹의 선택값에 따라 이 옵션이 노출됩니다. 조건이
        없으면 항상 노출됩니다.
      </span>
    </>
  );
}
