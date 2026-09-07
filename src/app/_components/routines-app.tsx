"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";

import { RoutineList } from "@/app/_components/routines-app-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getRoutines, getState, resetAll } from "@/lib/storage";
import type { Routine, RoutineProgress } from "@/types";

export function RoutinesApp() {
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [state, setState] = useState<Record<string, RoutineProgress>>({});
  const [resetAllOpen, setResetAllOpen] = useState(false);
  const t = useTranslations();
  const hasCheckedSteps = routines.some((routine) => {
    const checkedStepIds = state[routine.id]?.checkedStepIds ?? [];
    return routine.steps.some((step) => checkedStepIds.includes(step.id));
  });

  useEffect(() => {
    startTransition(() => {
      setRoutines(getRoutines());
      setState(getState());
    });
  }, []);

  function openNewRoutine() {
    router.push("/new");
  }

  function handleResetAll() {
    setState(resetAll());
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
      />
      <Dialog open={resetAllOpen} onOpenChange={setResetAllOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("resetAllTitle")}</DialogTitle>
            <DialogDescription>{t("resetAllDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetAllOpen(false)}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleResetAll}>
              {t("reset")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
