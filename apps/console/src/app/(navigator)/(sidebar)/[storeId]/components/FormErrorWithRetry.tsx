import { Button } from "@ssurak/ui/components/buttons/button";
import { Info } from "lucide-react";

type FormErrorAndRetryProps = {
  title: string;
  errorMessage?: string;
};

export default function FormErrorWithRetry({
  title,
  errorMessage,
}: FormErrorAndRetryProps) {
  if (!errorMessage) return null;

  return (
    <div className="w-full max-w-md mx-auto mt-6 p-4 flex gap-x-2 border border-red-200 rounded-2xl bg-red-50 text-red-500 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400 animate-fade-in-up">
      <Info width={20} className="shrink-0" />
      <div className="flex flex-col gap-y-1 min-w-0">
        <span className="text-sm font-bold">{title}</span>
        <p className="text-xs wrap-break-word">{errorMessage}</p>
      </div>
      <Button
        type="submit"
        className="shrink-0 ml-auto border-red-200 bg-background text-red-500 shadow-none font-semibold dark:border-red-900 dark:text-red-400 dark:shadow-none hover:text-red-400 hover:bg-background/60"
        variant={"outline"}
      >
        다시 시도
      </Button>
    </div>
  );
}
