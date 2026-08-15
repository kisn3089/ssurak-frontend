import { useSyncExternalStore } from "react";

import {
  getRawLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
  subscribeLocalStorage,
} from "../utils/local-storage";

type UseLocalStorageOptions<T> = {
  /** 저장된 값이 없거나, 형식이 깨졌거나, 스토리지에 접근할 수 없을 때 쓰는 값. */
  fallback: T;
  parse: (raw: unknown) => T | null;
};

function readStoredValue<T>(
  key: string,
  raw: string | null,
  { fallback, parse }: UseLocalStorageOptions<T>
): T {
  if (raw === null) return fallback;

  try {
    return parse(JSON.parse(raw)) ?? fallback;
  } catch (error) {
    console.error(`Failed to parse localStorage item for key "${key}":`, error);
    return fallback;
  }
}

/**
 * localStorage 값을 React 상태처럼 읽고 쓴다.
 * @returns `[value, setValue, remove]`. setValue·remove는 반영 성공 여부를 반환한다.
 */
export default function useLocalStorage<T>(
  key: string,
  options: UseLocalStorageOptions<T>
): [T, (value: T) => boolean, () => boolean] {
  const raw = useSyncExternalStore(
    (onStoreChange) => subscribeLocalStorage(key, onStoreChange),
    () => getRawLocalStorageItem(key),
    () => null
  );

  const value = readStoredValue(key, raw, options);
  const setValue = (next: T) => setLocalStorageItem(key, next);
  const remove = () => removeLocalStorageItem(key);

  return [value, setValue, remove];
}
