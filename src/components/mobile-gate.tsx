import { type ReactNode, useEffect } from "react";

import { useTranslation } from "@/i18n/use-translation";

export function MobileGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  useEffect(() => {
    // sw.js is only built in production (see vite.config.ts); registering it
    // in dev would also fight Vite's own HMR with a caching service worker.
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
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
