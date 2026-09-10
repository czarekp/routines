import { useTranslation } from "@/i18n/use-translation";

// Shown by the "/routine" and "/routine/edit" views when the `?id=` in the URL
// no longer matches a stored routine (e.g. it was deleted in another tab).
export function MissingRoutine() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto min-h-dvh w-[min(100%,480px)] px-5 pt-5 pb-10">
      <p>{t("routineNotFound")}</p>
    </div>
  );
}
