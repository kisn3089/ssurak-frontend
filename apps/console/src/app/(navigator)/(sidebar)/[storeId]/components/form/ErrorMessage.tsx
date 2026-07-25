export default function ErrorMessage({
  errorMessage,
}: {
  errorMessage?: string;
}) {
  return (
    <p
      className={`${errorMessage ? "visible" : "invisible"} min-h-4 text-xs text-red-500`}
    >
      {errorMessage}
    </p>
  );
}
