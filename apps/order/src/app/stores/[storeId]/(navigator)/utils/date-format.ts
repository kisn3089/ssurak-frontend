export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
  overrideLocale?: string
): string {
  const locale: Intl.LocalesArgument = overrideLocale ?? "ko-KR";

  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };

  return new Date(date).toLocaleString(locale, options || defaultOptions);
}
