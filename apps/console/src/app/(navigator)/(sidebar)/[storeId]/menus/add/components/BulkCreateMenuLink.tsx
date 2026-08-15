import { Button } from "@ssurak/ui/components/buttons/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export default function BulkCreateMenuLink() {
  return (
    <Button className="h-11 rounded-3xl px-5 font-semibold" asChild>
      <Link href={"bulk"}>
        <PlusIcon strokeWidth={2.5} />
        여러 메뉴 추가
      </Link>
    </Button>
  );
}
