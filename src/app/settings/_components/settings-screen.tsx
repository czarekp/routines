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
    <section className="settings-list" aria-label={t("settings")}>
      <div className="settings-row">
        <div className="settings-row-copy">
          <strong>{t("language")}</strong>
          <span>{language === "pl" ? "Polski" : "English"}</span>
        </div>
        <Select
          value={language}
          onValueChange={(value) => setLocale(value as "pl" | "en")}
        >
          <SelectTrigger className="language-select" aria-label={t("language")}>
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
    <div className="app-shell">
      <AppBar title={t("settings")} onBack={onBack} />
      <SettingsPanel />
    </div>
  );
}
