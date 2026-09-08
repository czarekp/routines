"use client";

import { useTranslations } from "next-intl";
import { ReactNode, useEffect } from "react";

export function MobileGate({ children }: { children: ReactNode }) {
  const t = useTranslations();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/routines/sw.js")
        .catch(() => undefined);
    }
  }, []);

  return (
    <>
      <main className="bg-background block min-h-dvh min-[481px]:hidden">
        {children}
      </main>
      <section
        className="bg-background text-muted-foreground hidden min-h-dvh place-items-center p-8 text-center min-[481px]:grid"
        aria-live="polite"
      >
        <p>{t("mobileOnly")}</p>
      </section>
    </>
  );
}
