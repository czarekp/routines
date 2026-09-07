"use client";

import { Check, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  const t = useTranslations();
  return (
    <div className="empty-state">
      <div className="empty-mark">
        <Check />
      </div>
      <h2>{t("emptyTitle")}</h2>
      <p>{t("emptyDescription")}</p>
      <Button onClick={onCreate}>
        <Plus /> {t("newRoutine")}
      </Button>
    </div>
  );
}

export function EmptySteps({ onEdit }: { onEdit: () => void }) {
  const t = useTranslations();
  return (
    <div className="empty-state empty-steps">
      <p>{t("noSteps")}</p>
      <Button variant="outline" onClick={onEdit}>
        <Plus /> {t("addFirstStep")}
      </Button>
    </div>
  );
}
