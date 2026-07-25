interface Option {
  key: string;
  price: number;
}

interface MenuOption {
  defaultKey: string;
  options: Option[];
}

export interface DetailMenu {
  publicId: string;
  name: string;
  description: string | null;
  price: number;
  isAvailable: boolean;
  requiredOptions: Record<string, MenuOption> | null;
  customOptions: Record<string, MenuOption> | null;
  quantity?: number;
  imageKey?: string | null; // 이미지 키를 추가하여 이미지 URL을 가져올 수 있도록 함
}

export interface MenuOptionEntry {
  key: string;
  optionInfo: MenuOption;
}

export interface MenuDetailProviderProps {
  menu: DetailMenu;
  children: React.ReactNode;
}

export type SelectedOptions = {
  required: Map<string, string>;
  custom: Map<string, string>;
};

export type SnapshotToFetch = () => {
  menuPublicId: string;
  quantity: number;
  menuName: string;
  price: number;
  requiredOptions?: Record<string, string> | undefined;
  customOptions?: Record<string, string> | undefined;
};

export type SelectOption = (groupKey: string, optionKey: string) => void;
