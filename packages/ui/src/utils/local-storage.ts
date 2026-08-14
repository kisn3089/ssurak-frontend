const isBrowser = typeof window !== "undefined" && "localStorage" in window;

type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();

let isStorageEventBound = false;

function notify(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

function handleStorageEvent(event: StorageEvent) {
  if (event.storageArea !== localStorage) return;

  // clear() 는 key가 null로 들어오기 때문에 어떤 키가 지워졌는지 알 수 없으므로 전부 깨운다.
  if (event.key === null) {
    listeners.forEach((keyListeners) =>
      keyListeners.forEach((listener) => listener())
    );
    return;
  }

  notify(event.key);
}

/**
 * key의 변경을 구독한다. 같은 탭의 쓰기(이 모듈 경유)와 다른 탭의 쓰기를 모두 전달한다.
 * `useSyncExternalStore`의 subscribe로 그대로 넘길 수 있다.
 */
export function subscribeLocalStorage(
  key: string,
  onStoreChange: () => void
): () => void {
  if (!isBrowser) return () => {};

  const keyListeners = listeners.get(key) ?? new Set<Listener>();
  keyListeners.add(onStoreChange);
  listeners.set(key, keyListeners);

  if (!isStorageEventBound) {
    window.addEventListener("storage", handleStorageEvent);
    isStorageEventBound = true;
  }

  return () => {
    keyListeners.delete(onStoreChange);
    if (keyListeners.size === 0) listeners.delete(key);

    if (listeners.size === 0 && isStorageEventBound) {
      window.removeEventListener("storage", handleStorageEvent);
      isStorageEventBound = false;
    }
  };
}

export function getRawLocalStorageItem(key: string): string | null {
  if (!isBrowser) return null;

  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Failed to read localStorage item for key "${key}":`, error);
    return null;
  }
}

/**
 * @param parse `JSON.parse` 결과를 검증해 도메인 타입으로 좁힌다. 스토리지 값은
 * 런타임 검증을 요구한다. zod를 쓴다면 `(raw) => schema.safeParse(raw).data ?? null`.
 */
export function getLocalStorageItem<T>(
  key: string,
  parse: (raw: unknown) => T | null
): T | null {
  const item = getRawLocalStorageItem(key);
  if (item === null) return null;

  try {
    return parse(JSON.parse(item));
  } catch (error) {
    console.error(`Failed to parse localStorage item for key "${key}":`, error);
    return null;
  }
}

export function setLocalStorageItem<T>(key: string, value: T): boolean {
  if (!isBrowser) return false;

  if (value === undefined) return removeLocalStorageItem(key);

  try {
    const serializedValue = JSON.stringify(value);

    // 함수·심볼도 JSON.stringify가 문자열이 아닌 undefined를 반환한다. 그대로 넘기면
    // setItem이 "undefined" 문자열로 저장해버리고 다음 읽기에서 JSON.parse가 깨진다.
    if (typeof serializedValue !== "string") {
      console.error(
        `Failed to serialize localStorage value for key "${key}": ${typeof value} is not serializable`
      );
      return false;
    }

    localStorage.setItem(key, serializedValue);
    notify(key);
    return true;
  } catch (error) {
    console.error(
      `Failed to serialize and set localStorage item for key "${key}":`,
      error
    );
    return false;
  }
}

export function removeLocalStorageItem(key: string): boolean {
  if (!isBrowser) return false;

  try {
    localStorage.removeItem(key);
    notify(key);
    return true;
  } catch (error) {
    console.error(
      `Failed to remove localStorage item for key "${key}":`,
      error
    );
    return false;
  }
}
