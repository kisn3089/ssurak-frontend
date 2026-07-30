import { toast } from "@ssurak/ui/components/sonner";

export default function notifyFailure(
  title: string,
  description: string,
  retry?: () => void
) {
  toast.error(title, {
    description,
    duration: Infinity,
    closeButton: true,
    position: "top-center",
    ...(retry && { action: { label: "재시도", onClick: retry } }),
  });
}
