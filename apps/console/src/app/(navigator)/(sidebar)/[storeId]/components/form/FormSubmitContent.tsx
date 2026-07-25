import { Spinner } from "@ssurak/ui/components/spinner";

export function previewSuccessContent(buttonText: string) {
  return `${buttonText}되었습니다.`;
}

type FormSubmitContentProps = {
  isLoading: boolean;
  buttonText: string;
};

export default function FormSubmitContent({
  isLoading,
  buttonText,
}: FormSubmitContentProps) {
  return isLoading ? (
    <>
      <Spinner />
      {`${buttonText} 중...`}
    </>
  ) : (
    `${buttonText}`
  );
}
