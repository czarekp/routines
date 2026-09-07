"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export function AppBar({
  title,
  onBack,
  action,
}: {
  title: string;
  onBack: () => void;
  action?: React.ReactNode;
}) {
  const t = useTranslations();

  return (
    <header className="sub-header">
      <Button
        variant="ghost"
        size="icon-lg"
        aria-label={t("back")}
        onClick={onBack}
      >
        <ArrowLeft />
      </Button>
      <h1>{title}</h1>
      {action ?? <span className="header-spacer" />}
    </header>
  );
}
