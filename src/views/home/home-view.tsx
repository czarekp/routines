import { useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useRoutines, useRoutineState } from "@/hooks/use-store";
import { useTranslation } from "@/i18n/use-translation";
import { reorderRoutines, resetAll } from "@/lib/storage";
import { RoutineList } from "@/views/home/routine-list";

export function HomeView() {
  const navigate = useNavigate();
  const routines = useRoutines();
  const state = useRoutineState();
  const [resetAllOpen, setResetAllOpen] = useState(false);
  const { t } = useTranslation();
  const hasCheckedSteps = routines.some((routine) => {
    const checkedStepIds = state[routine.id]?.checkedStepIds ?? [];
    return routine.steps.some((step) => checkedStepIds.includes(step.id));
  });

  function openNewRoutine() {
    navigate("/new");
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
          navigate(`/routine?id=${encodeURIComponent(routineId)}`)
        }
        onResetAll={() => setResetAllOpen(true)}
        onReorder={reorderRoutines}
      />
      <Drawer
        showSwipeHandle
        open={resetAllOpen}
        onOpenChange={setResetAllOpen}
      >
        <DrawerContent>
          <DrawerHeader className="group-data-[swipe-axis=y]/drawer-popup:text-left">
            <DrawerTitle>{t("resetAllTitle")}</DrawerTitle>
            <DrawerDescription>{t("resetAllDescription")}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="pb-[calc(16px+env(safe-area-inset-bottom))]">
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
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
