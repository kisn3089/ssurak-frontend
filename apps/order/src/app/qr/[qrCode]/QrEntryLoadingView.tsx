import { Spinner } from "@ssurak/ui/components/spinner";

export default function QrEntryLoadingView() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-3">
      <Spinner className="w-6 h-8" />
      <p className="text-sm text-muted-foreground">
        테이블 정보를 확인하고 있어요...
      </p>
    </div>
  );
}
