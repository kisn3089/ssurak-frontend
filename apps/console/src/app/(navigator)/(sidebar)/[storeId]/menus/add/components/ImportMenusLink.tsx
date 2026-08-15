"use client";

import { Button } from "@ssurak/ui/components/buttons/button";
import { Sparkle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ImportMenusLink() {
  const { storeId } = useParams<{ storeId: string }>();
  return (
    <Button
      asChild
      className="group bg-linear-to-r from-teal-500 to-emerald-500 rounded-full shadow-lg shadow-teal-500/30 hover:from-teal-400 hover:to-emerald-400 hover:shadow-teal-500/40 hover:shadow-xl border-none font-bold has-[>svg]:px-4 has-[>svg]:py-5 h-11"
    >
      <Link href={`/${storeId}/menus/import`}>
        <Sparkle
          className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90"
          fill="currentColor"
        />
        사진으로 메뉴 일괄 생성
      </Link>
    </Button>
  );
}
