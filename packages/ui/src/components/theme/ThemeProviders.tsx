"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster, ToasterProps } from "../sonner";
import ActionStatusProvider from "../action-status/ActionStatusProvider";

export function NextThemeProviders({
  children,
  options,
}: {
  children: React.ReactNode;
  options?: ToasterProps;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      // disableTransitionOnChange
      enableColorScheme
    >
      <Toaster {...options} />
      <ActionStatusProvider
        statusMetaText={{
          loading: "저장 중...",
          success: "저장됨",
          error: "저장하지 못했습니다. 계속 편집하면 다시 시도합니다.",
        }}
      >
        {children}
      </ActionStatusProvider>
    </NextThemesProvider>
  );
}
