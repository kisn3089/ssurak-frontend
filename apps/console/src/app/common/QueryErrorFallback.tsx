"use client";

import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ComponentType } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

type QueryErrorFallbackProps = {
  children: React.ReactNode;
  FallbackComponent: ComponentType<FallbackProps & { title: string }>;
  fallbackProps: { title: string };
};

export default function QueryErrorFallback({
  children,
  FallbackComponent,
  fallbackProps,
}: QueryErrorFallbackProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={(errorProps) => (
            <FallbackComponent {...errorProps} {...fallbackProps} />
          )}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
