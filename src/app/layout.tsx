import "./globals.css";

import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { Figtree, Inter } from "next/font/google";

import { AppLockGate } from "@/components/app-lock-gate";
import { I18nProvider } from "@/components/i18n-provider";
import { MobileGate } from "@/components/mobile-gate";
import { cn } from "@/lib/utils";

import { ReactNode } from "react";
import messages from "../../messages/en.json";

const figtreeHeading = Figtree({
  subsets: ["latin"],
  variable: "--font-heading",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Routines",
  description: "A quiet daily checklist",
  manifest: "/routines/manifest.json",
  icons: {
    icon: "/routines/icon.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        inter.variable,
        figtreeHeading.variable,
      )}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider locale="en" messages={messages}>
          <I18nProvider>
            <MobileGate>
              <AppLockGate>{children}</AppLockGate>
            </MobileGate>
          </I18nProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
