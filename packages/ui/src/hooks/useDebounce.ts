import { useEffect, useRef, type DependencyList } from "react";

/** @param delay ms */
export default function useDebounce(
  callback: () => void,
  delay: number,
  deps: DependencyList
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const timer = setTimeout(() => callbackRef.current(), delay);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, ...deps]);
}
