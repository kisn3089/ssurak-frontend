/**
 * MenuDetail Compound Component
 *
 * 사용 예시:
 * <MenuDetail.Provider menu={menu}>
 *   <MenuDetail.Info>
 *     <MenuDetail.Counter />
 *   </MenuDetail.Info>
 *   <MenuDetail.Options />
 * </MenuDetail.Provider>
 */

import { MenuDetailProvider } from "./MenuDetailProvider";
import { MenuDetailOptions } from "./MenuDetailOptions";
import { MenuDetailContext } from "./MenuDetailContext";
import MenuDetailInfo from "./MenuDetailInfo";

export const MenuDetail = {
  Provider: MenuDetailProvider,
  Info: MenuDetailInfo,
  Options: MenuDetailOptions,
  Context: MenuDetailContext,
};
