"use client";

import Options from "../options/Options";
import { useMenuDetailContext } from "./MenuDetailContext";

export function MenuDetailOptions() {
  const {
    meta: { options, visibleOptionIds },
  } = useMenuDetailContext();

  return <Options options={options} visibleOptionIds={visibleOptionIds} />;
}
