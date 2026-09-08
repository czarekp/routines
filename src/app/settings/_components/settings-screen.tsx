"use client";

import { useLocale, useTranslations } from "next-intl";

import { AppBar } from "@/app/_components/app-bar";
import { useI18n } from "@/components/i18n-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SettingsPanel() {
  const t = useTranslations();
  const language = useLocale() as "pl" | "en";
  const { setLocale } = useI18n();

  return (
    <section className="grid gap-2.5" aria-label={t("settings")}>
      <div className="bg-card flex min-h-18 items-center justify-between gap-4 rounded-lg border-0 px-4 py-3.5">
        <div className="grid gap-1.5">
          <strong className="font-heading text-lg font-semibold">
            {t("language")}
          </strong>
          <span className="text-muted-foreground text-sm">
            {language === "pl" ? "Polski" : "English"}
          </span>
        </div>
        <Select
          value={language}
          onValueChange={(value) => setLocale(value as "pl" | "en")}
        >
          <SelectTrigger
            className="h-8.5 w-auto min-w-26 text-sm"
            aria-label={t("language")}
          >
            <SelectValue>
              {(value) => (value === "en" ? "English" : "Polski")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pl">Polski</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const t = useTranslations();

  return (
    <div className="mx-auto min-h-dvh w-[min(100%,480px)] px-5 pt-5 pb-10">
      <AppBar title={t("settings")} onBack={onBack} />
      <SettingsPanel />
    </div>
  );
}
