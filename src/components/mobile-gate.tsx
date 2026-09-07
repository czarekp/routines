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
      <main className="mobile-app">{children}</main>
      <section className="desktop-message" aria-live="polite">
        <p>{t("mobileOnly")}</p>
      </section>
    </>
  );
}
