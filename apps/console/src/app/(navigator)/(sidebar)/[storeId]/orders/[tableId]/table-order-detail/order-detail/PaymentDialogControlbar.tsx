import {
  HealthCheckResponse,
  httpMe,
} from "@ssurak/api/core/identity/me/httpMe";
import { useCancelableAsync } from "@ssurak/api/hooks/useCancelableAsync";
import ActivityRender from "@ssurak/ui/components/activity-render/ActivityRender";
import {
  AlertDialogAction,
  AlertDialogCancel,
} from "@ssurak/ui/components/alert-dialog/alert-dialog";
import { Spinner } from "@ssurak/ui/components/spinner";
import { SetStateAction, useState } from "react";

interface PaymentDialogControlbarProps {
  children: React.ReactNode;
  setOpen: (value: SetStateAction<boolean>) => void;
}

export default function PaymentDialogControlbar({
  children,
  setOpen,
}: PaymentDialogControlbarProps) {
  const [isError, setIsError] = useState(false);

  const payment = async (
    signal: AbortSignal,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    const result: HealthCheckResponse = await httpMe.fetchHealthCheck({
      signal,
    });
    return result;
  };

  const paymentTransaction = useCancelableAsync<
    [React.MouseEvent<HTMLButtonElement>],
    HealthCheckResponse
  >(payment);

  const tryPayment = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      setIsError(false);
      await paymentTransaction.run(e);
      setOpen(false);
    } catch {
      e.preventDefault();
      setIsError(true);
    }
  };

  return (
    <>
      <AlertDialogCancel onClick={paymentTransaction.abort}>
        취소
      </AlertDialogCancel>
      <AlertDialogAction
        onClick={tryPayment}
        className={
          isError
            ? "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
            : ""
        }
        disabled={paymentTransaction.isPending}
      >
        <ActivityRender
          value={!paymentTransaction.isPending}
          fallback={<LoadingTransaction />}
        >
          {() => (isError ? "결제 실패, 다시 시도" : children)}
        </ActivityRender>
      </AlertDialogAction>
    </>
  );
}

function LoadingTransaction() {
  return (
    <>
      <Spinner />
      {"결제 처리 중..."}
    </>
  );
}
