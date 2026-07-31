import React from "react";

type AsyncFunction<TArgs extends unknown[], TReturn> = (
  signal: AbortSignal,
  ...args: TArgs
) => Promise<TReturn>;

type CancelableAsyncReturn<TArgs extends unknown[], TReturn> = {
  run: (...args: TArgs) => Promise<TReturn | undefined>;
  isPending: boolean;
  abort: () => void;
};

export function useCancelableAsync<TArgs extends unknown[], TReturn>(
  promiseFunction: AsyncFunction<TArgs, TReturn>
): CancelableAsyncReturn<TArgs, TReturn> {
  const [isPending, startTransition] = React.useTransition();
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // 컴포넌트 언마운트 시 정보 유실 방지
  React.useEffect(() => {
    if (isPending) {
      window.onbeforeunload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        return "";
      };
    } else {
      window.onbeforeunload = null;
    }
  }, [isPending]);

  // 컴포넌트 언마운트 시 요청 취소
  React.useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const run = async (...args: TArgs): Promise<TReturn | undefined> => {
    // 이전 요청이 있으면 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    return new Promise((resolve, reject) => {
      startTransition(async () => {
        try {
          const result = await promiseFunction(
            abortControllerRef.current!.signal,
            ...args
          );
          resolve(result);
        } catch (error) {
          if (error instanceof Error && error.name === "CanceledError") {
            console.warn("작업이 취소되었습니다.");
            resolve(undefined);
          } else {
            reject(error);
          }
        } finally {
          abortControllerRef.current = null;
        }
      });
    });
  };

  const abort = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return { run, isPending, abort };
}
