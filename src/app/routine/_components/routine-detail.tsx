"use client";

import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";

import { AppBar } from "@/app/_components/app-bar";
import { EmptySteps } from "@/app/_components/empty-states";
import { ProgressRing } from "@/app/_components/progress-ring";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { sortSteps } from "@/lib/routine-utils";
import type { Routine, RoutineProgress } from "@/types";

export function RoutineDetail({
  routine,
  progress,
  onBack,
  onEdit,
  onToggle,
  onReset,
}: {
  routine: Routine;
  progress?: RoutineProgress;
  onBack: () => void;
  onEdit: () => void;
  onToggle: (routineId: string, stepId: string) => void;
  onReset: () => void;
}) {
  const t = useTranslations();
  const checkedStepIds = progress?.checkedStepIds ?? [];
  const completed = checkedStepIds.filter((id) =>
    routine.steps.some((step) => step.id === id),
  ).length;

  return (
    <div className="app-shell routine-detail-screen">
      <AppBar
        title={routine.name || t("unnamed")}
        onBack={onBack}
        action={
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={t("editRoutine")}
            onClick={onEdit}
          >
            <Pencil />
          </Button>
        }
      />
      {routine.steps.length === 0 ? (
        <EmptySteps onEdit={onEdit} />
      ) : (
        <section className="step-list" aria-label={t("routineSteps")}>
          {sortSteps(routine.steps).map((step) => {
            const checked = checkedStepIds.includes(step.id);
            return (
              <div
                className={`step-row ${checked ? "step-row-checked" : ""}`}
                key={step.id}
                role="checkbox"
                aria-checked={checked}
                tabIndex={0}
                onClick={() => onToggle(routine.id, step.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onToggle(routine.id, step.id);
                  }
                }}
              >
                <Checkbox checked={checked} tabIndex={-1} aria-hidden="true" />
                <span>{step.text}</span>
              </div>
            );
          })}
        </section>
      )}
      <div className="routine-detail-actions">
        <Button
          className="routine-reset-button"
          variant="outline"
          disabled={completed === 0}
          onClick={onReset}
        >
          {t("reset")}
        </Button>
        <ProgressRing
          completed={completed}
          total={routine.steps.length}
          ariaLabel={`${completed} / ${routine.steps.length} ${t("completed")}`}
        />
      </div>
    </div>
  );
}
