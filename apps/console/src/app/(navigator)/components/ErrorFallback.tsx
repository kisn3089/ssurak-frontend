import { useAuthInfo } from "@ssurak/auth/providers/AuthenticationProvider";
import { Button } from "@ssurak/ui/components/buttons/button";
import { useEffect } from "react";
import { FallbackProps } from "react-error-boundary";

/**
 * @description children의 Element id 값이 "retry"와 "sign-out"인 요소에 이벤트 리스너를 등록하고,
 * children을 렌더링한다.
 *
 * @property 아래 event trigger는 Element id 값을 기준으로 한다.
 * @event retry 클릭 시 resetErrorBoundary 호출
 * @event sign-out 클릭 시 signOut 호출
 */
export default function ErrorFallback({
  error,
  resetErrorBoundary,
  children,
}: FallbackProps & React.PropsWithChildren) {
  const { signOut } = useAuthInfo();

  useEffect(() => {
    if (!children) {
      return;
    }

    const retryElement = document.getElementById("retry");
    const signOutElement = document.getElementById("sign-out");

    retryElement?.addEventListener("click", resetErrorBoundary);
    signOutElement?.addEventListener("click", signOut);

    return () => {
      retryElement?.removeEventListener("click", resetErrorBoundary);
      signOutElement?.removeEventListener("click", signOut);
    };
  }, [children, resetErrorBoundary, signOut]);

  if (children) {
    return children;
  }

  return (
    <DefaultErrorFallback
      error={error}
      resetErrorBoundary={resetErrorBoundary}
    />
  );
}

function DefaultErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const { signOut } = useAuthInfo();

  const isServerError = error instanceof Error && error.message === "Error";
  const errorMessage = isServerError
    ? "서버와 연결할 수 없습니다. 네트워크를 확인한 뒤 다시 시도해 주세요."
    : error.message || "알 수 없는 오류가 발생했습니다.";

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] gap-2">
      <h2 className="text-xl font-semibold">오류가 발생했습니다.</h2>
      <p className="text-muted-foreground">{errorMessage}</p>
      <div className="flex gap-4">
        <Button onClick={resetErrorBoundary}>다시 시도</Button>
        <Button onClick={signOut} variant={"secondary"}>
          로그아웃
        </Button>
      </div>
    </div>
  );
}
