"use client";

import { ChevronRight, Plus, RotateCcw, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { EmptyState } from "@/app/_components/empty-states";
import { ProgressRing } from "@/app/_components/progress-ring";
import { SettingsPanel } from "@/app/settings/_components/settings-screen";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Routine, RoutineProgress } from "@/types";

export function RoutineList({
  routines,
  state,
  hasCheckedSteps,
  onCreate,
  onOpen,
  onResetAll,
}: {
  routines: Routine[];
  state: Record<string, RoutineProgress>;
  hasCheckedSteps: boolean;
  onCreate: () => void;
  onOpen: (routineId: string) => void;
  onResetAll: () => void;
}) {
  const t = useTranslations();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>{t("appName")}</h1>
        <Button
          className="settings-button"
          variant="outline"
          size="icon-lg"
          aria-label={t("settings")}
          onClick={() => setSettingsOpen(true)}
        >
          <Settings />
        </Button>
      </header>
      {routines.length === 0 ? (
        <EmptyState onCreate={onCreate} />
      ) : (
        <section className="routine-list" aria-label={t("routinesList")}>
          {routines.map((routine) => {
            const checkedCount =
              state[routine.id]?.checkedStepIds.filter((id) =>
                routine.steps.some((step) => step.id === id),
              ).length ?? 0;
            return (
              <button
                className="routine-row"
                key={routine.id}
                onClick={() => onOpen(routine.id)}
              >
                <ProgressRing
                  compact
                  completed={checkedCount}
                  total={routine.steps.length}
                  ariaLabel={`${checkedCount} / ${routine.steps.length} ${t("completed")}`}
                />
                <span className="routine-row-copy">
                  <strong>{routine.name || t("unnamed")}</strong>
                </span>
                <ChevronRight aria-hidden="true" />
              </button>
            );
          })}
        </section>
      )}
      {routines.length > 0 && (
        <Button
          className="fixed-reset-button"
          variant="outline"
          disabled={!hasCheckedSteps}
          onClick={onResetAll}
        >
          <RotateCcw aria-hidden="true" />
          {t("resetAll")}
        </Button>
      )}
      <Button
        className="fixed-add-button"
        size="icon-lg"
        aria-label={t("newRoutine")}
        onClick={onCreate}
      >
        <Plus />
      </Button>
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent side="bottom" className="settings-sheet">
          <SheetHeader>
            <SheetTitle>{t("settings")}</SheetTitle>
          </SheetHeader>
          <SettingsPanel />
        </SheetContent>
      </Sheet>
    </div>
  );
}
