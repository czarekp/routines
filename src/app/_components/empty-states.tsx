"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

const emptyStateClass =
  "grid min-h-[calc(100dvh-72px-60px)] w-full -translate-y-8 content-center justify-items-center gap-4 px-4.5 py-5 text-center";

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  const t = useTranslations();
  return (
    <div className={emptyStateClass}>
      <h2 className="font-heading m-0 text-xl">{t("emptyTitle")}</h2>
      <p className="text-muted-foreground mx-0 mt-0 mb-2 max-w-70 text-sm leading-normal">
        {t("emptyDescription")}
      </p>
      <Button onClick={onCreate}>
        <Plus /> {t("newRoutine")}
      </Button>
    </div>
  );
}

export function EmptySteps({ onEdit }: { onEdit: () => void }) {
  const t = useTranslations();
  return (
    <div className={`${emptyStateClass} pt-10`}>
      <p className="text-muted-foreground mx-0 mt-0 mb-2 max-w-70 text-sm leading-normal">
        {t("noSteps")}
      </p>
      <Button variant="outline" onClick={onEdit}>
        <Plus /> {t("addFirstStep")}
      </Button>
    </div>
  );
}
