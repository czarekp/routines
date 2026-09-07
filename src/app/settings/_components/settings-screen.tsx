"use client";

import { useLocale, useTranslations } from "next-intl";

import { AppBar } from "@/app/_components/app-bar";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";

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
        <div
          className="language-options"
          role="group"
          aria-label={t("language")}
        >
          <Button
            className="language-option"
            variant={language === "pl" ? "default" : "outline"}
            onClick={() => setLocale("pl")}
            aria-pressed={language === "pl"}
          >
            Polski
          </Button>
          <Button
            className="language-option"
            variant={language === "en" ? "default" : "outline"}
            onClick={() => setLocale("en")}
            aria-pressed={language === "en"}
          >
            English
          </Button>
        </div>
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
