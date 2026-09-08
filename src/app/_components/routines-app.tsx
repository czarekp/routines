"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { RoutineList } from "@/app/_components/routines-app-list";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { reorderRoutines, resetAll } from "@/lib/storage";
import { useRoutines, useRoutineState } from "@/lib/use-store";

export function RoutinesApp() {
  const router = useRouter();
  const routines = useRoutines();
  const state = useRoutineState();
  const [resetAllOpen, setResetAllOpen] = useState(false);
  const t = useTranslations();
  const hasCheckedSteps = routines.some((routine) => {
    const checkedStepIds = state[routine.id]?.checkedStepIds ?? [];
    return routine.steps.some((step) => checkedStepIds.includes(step.id));
  });

  function openNewRoutine() {
    router.push("/new");
  }

  function handleResetAll() {
    resetAll();
    setResetAllOpen(false);
  }

  return (
    <>
      <RoutineList
        routines={routines}
        state={state}
        hasCheckedSteps={hasCheckedSteps}
        onCreate={openNewRoutine}
        onOpen={(routineId) =>
          router.push(`/routine?id=${encodeURIComponent(routineId)}`)
        }
        onResetAll={() => setResetAllOpen(true)}
        onReorder={reorderRoutines}
      />
      <Sheet open={resetAllOpen} onOpenChange={setResetAllOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-lg pb-[calc(16px+env(safe-area-inset-bottom))]"
        >
          <SheetHeader>
            <SheetTitle>{t("resetAllTitle")}</SheetTitle>
            <SheetDescription>{t("resetAllDescription")}</SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <Button
              className="min-h-12.5 text-base"
              variant="outline"
              onClick={() => setResetAllOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              className="min-h-12.5 text-base"
              variant="destructive"
              onClick={handleResetAll}
            >
              {t("reset")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
