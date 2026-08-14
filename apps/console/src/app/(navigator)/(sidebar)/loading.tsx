import { Spinner } from "@ssurak/ui/components/spinner";

export default function SidebarSegmentLoading() {
  return (
    <div className="flex h-[calc(100vh-56px)] w-full items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  );
}
