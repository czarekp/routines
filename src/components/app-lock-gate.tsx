"use client";

import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  ReactNode,
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

import { Button } from "@/components/ui/button";
import {
  disableAppLock,
  isAppLockSupported,
  isLockedOnServer,
  isSessionUnlocked,
  subscribeToUnlock,
  verifyAppLock,
} from "@/lib/app-lock";
import { useAppSettings } from "@/lib/use-store";

/**
 * Hides the app behind a platform-authenticator prompt when the lock is on.
 * Being unlocked is per-session state, so closing the app locks it again.
 *
 * This is a gate, not encryption — see the note in `src/lib/app-lock.ts`.
 */
export function AppLockGate({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const { lock } = useAppSettings();
  const unlocked = useSyncExternalStore(
    subscribeToUnlock,
    isSessionUnlocked,
    isLockedOnServer,
  );
  const [checking, setChecking] = useState(false);
  // The escape hatch stays hidden until the device actually lets the user down,
  // so a working lock does not advertise its own bypass.
  const [showEscape, setShowEscape] = useState(false);
  const [failed, setFailed] = useState(false);

  const unlock = useCallback(async () => {
    if (!lock) return;
    setChecking(true);
    setFailed(false);
    const passed = await verifyAppLock(lock);
    setChecking(false);
    if (passed) return;
    setFailed(true);
    setShowEscape(true);
  }, [lock]);

  useEffect(() => {
    if (!lock || unlocked) return;
    // A device that lost its authenticator would otherwise strand the user.
    void isAppLockSupported().then((supported) => {
      if (!supported) setShowEscape(true);
    });
  }, [lock, unlocked]);

  if (!lock || unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto grid min-h-dvh w-[min(100%,480px)] content-center justify-items-center gap-4 px-8 text-center">
      <Lock aria-hidden="true" className="text-muted-foreground size-8" />
      <h1 className="font-heading m-0 text-xl font-semibold">
        {t("lockedTitle")}
      </h1>
      <p className="text-muted-foreground m-0 max-w-70 text-sm leading-normal">
        {failed ? t("unlockFailed") : t("lockedDescription")}
      </p>
      <Button
        className="mt-2 min-h-12.5 px-6 text-base"
        disabled={checking}
        onClick={() => void unlock()}
      >
        {t("unlock")}
      </Button>
      {showEscape && (
        <Button
          variant="ghost"
          className="text-muted-foreground min-h-10.5"
          onClick={() => disableAppLock()}
        >
          {t("turnOffLock")}
        </Button>
      )}
    </div>
  );
}
