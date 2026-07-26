import { Spinner } from "@ssurak/ui/components/spinner";

export function previewSuccessContent(buttonText: string) {
  return `${buttonText}되었습니다.`;
}

type FormSubmitLabelProps = {
  isLoading: boolean;
  buttonText: string;
};

export default function FormSubmitLabel({
  isLoading,
  buttonText,
}: FormSubmitLabelProps) {
  return isLoading ? (
    <>
      <Spinner />
      {`${buttonText} 중...`}
    </>
  ) : (
    `${buttonText}`
  );
}
