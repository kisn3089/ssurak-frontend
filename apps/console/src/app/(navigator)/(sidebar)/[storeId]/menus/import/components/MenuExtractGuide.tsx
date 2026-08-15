import { cn } from "@ssurak/ui/lib/utils";
import {
  Clock,
  Info,
  ScanText,
  Sparkles,
  Sun,
  TriangleAlert,
} from "lucide-react";
import React from "react";

const GUIDE_MAP = [
  {
    icon: <ScanText size={16} />,
    title: "이름, 가격, 설명, 카테고리",
    description: "사진에 위 내용을 추출합니다. 없는 값은 비워둡니다.",
    className: "bg-blue-primary text-blue-primary-foreground",
  },
  {
    icon: <Info size={16} />,
    title: "이미지와 옵션은 제외",
    description: "이미지와 맵기, 사이즈 같은 선택 옵션은 등록 후 추가해주세요.",
    className: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  },
  {
    icon: <Sun size={16} />,
    title: "그늘과 반사를 피해서",
    description: "글자가 정면으로 보이는 사진이 가장 잘 읽힙니다.",
    className:
      "bg-amber-50 text-amber-500 dark:bg-amber-900 dark:text-amber-300",
  },
  {
    icon: <Clock size={16} />,
    title: "추출 내역은 12시간 동안 보관",
    description:
      "편집 시 다시 12시간 동안 보관됩니다. 이후에는 삭제되니 주의해주세요.",
  },
];

export default function MenuExtractGuide() {
  return (
    <>
      <div className="mt-4 pb-2 bg-background border border-border rounded-2xl">
        <div className="p-4 flex items-center gap-x-2 justify-center">
          <Sparkles size={18} className="text-blue-600" />
          <p className="text-md font-bold">AI 추출 안내</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4">
          {GUIDE_MAP.map((guide, index) => (
            <div key={index} className="flex flex-col gap-y-1 p-3">
              <div
                className={cn(
                  "bg-accent p-2 w-fit rounded-lg",
                  guide.className
                )}
              >
                {guide.icon}
              </div>
              <span className="text-sm font-bold">{guide.title}</span>
              <p className="text-xs text-muted-foreground">
                {guide.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      <AlertGuide />
    </>
  );
}

function AlertGuide() {
  return (
    <div className="flex items-center gap-x-3 mt-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200/70 dark:bg-amber-950/40 dark:border-amber-900/60">
      <TriangleAlert size={16} className="text-amber-700 dark:text-amber-400" />
      <p className="text-xs text-amber-900 dark:text-amber-200 font-semibold">
        AI가 읽어낸 값은 정확하지 않을 수 있습니다. 등록 전에 이름과 가격을 직접
        확인해주세요.
      </p>
    </div>
  );
}
