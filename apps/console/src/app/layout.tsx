import { Inter, JetBrains_Mono } from "next/font/google";
import "@ssurak/ui/globals.css";
import TanstackProvider from "@ssurak/api/core/TanstackProvider";
import React from "react";
import { ConsoleAuthProvider } from "@/providers/ConsoleAuthProvider";
import { NextThemeProviders } from "@ssurak/ui/components/theme/ThemeProviders";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ConsoleAuthProvider>
          <TanstackProvider>
            <NextThemeProviders
              options={{
                position: "bottom-right",
                swipeDirections: ["right"],
                richColors: true,
              }}
            >
              {children}
            </NextThemeProviders>
          </TanstackProvider>
        </ConsoleAuthProvider>
      </body>
    </html>
  );
}
