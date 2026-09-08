"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronRight,
  GripVertical,
  Plus,
  RotateCcw,
  Settings,
} from "lucide-react";
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

const fixedActionShadow = "shadow-[0_8px_22px_oklch(0_0_0_/_28%)]";

export function RoutineList({
  routines,
  state,
  hasCheckedSteps,
  onCreate,
  onOpen,
  onResetAll,
  onReorder,
}: {
  routines: Routine[];
  state: Record<string, RoutineProgress>;
  hasCheckedSteps: boolean;
  onCreate: () => void;
  onOpen: (routineId: string) => void;
  onResetAll: () => void;
  onReorder: (orderedIds: string[]) => void;
}) {
  const t = useTranslations();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const oldIndex = routines.findIndex((routine) => routine.id === active.id);
    const newIndex = routines.findIndex((routine) => routine.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(routines, oldIndex, newIndex).map((r) => r.id));
  }

  return (
    <div className="mx-auto flex min-h-dvh w-[min(100%,480px)] flex-col px-5 pt-5 pb-[calc(96px+env(safe-area-inset-bottom))]">
      <header className="bg-background sticky top-0 z-10 mb-1 flex h-17 items-center justify-between gap-4 py-2.5">
        <h1 className="font-heading m-0 text-3xl leading-[1.05] font-bold tracking-tight">
          {t("appName")}
        </h1>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label={t("settings")}
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="size-6" />
        </Button>
      </header>
      {routines.length === 0 ? (
        <EmptyState onCreate={onCreate} />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={routines.map((routine) => routine.id)}
            strategy={verticalListSortingStrategy}
          >
            <section
              className="mt-auto grid grid-cols-[minmax(0,1fr)] gap-2.5"
              aria-label={t("routinesList")}
            >
              {routines.map((routine) => {
                const checkedCount =
                  state[routine.id]?.checkedStepIds.filter((id) =>
                    routine.steps.some((step) => step.id === id),
                  ).length ?? 0;
                return (
                  <SortableRoutineRow
                    key={routine.id}
                    routine={routine}
                    checkedCount={checkedCount}
                    completedLabel={t("completed")}
                    unnamedLabel={t("unnamed")}
                    dragLabel={t("dragRoutine")}
                    onOpen={onOpen}
                  />
                );
              })}
            </section>
          </SortableContext>
        </DndContext>
      )}
      {routines.length > 0 && (
        <Button
          className={`fixed bottom-[calc(20px+env(safe-area-inset-bottom))] left-[max(20px,calc((100vw-480px)/2+20px))] z-20 min-h-13 rounded-lg px-4 ${fixedActionShadow}`}
          variant="outline"
          disabled={!hasCheckedSteps}
          onClick={onResetAll}
        >
          <RotateCcw aria-hidden="true" />
          {t("resetAll")}
        </Button>
      )}
      <Button
        className={`fixed right-[max(20px,calc((100vw-480px)/2+20px))] bottom-[calc(20px+env(safe-area-inset-bottom))] z-20 h-13 w-13 rounded-lg ${fixedActionShadow}`}
        size="icon-lg"
        aria-label={t("newRoutine")}
        onClick={onCreate}
      >
        <Plus className="size-6" />
      </Button>
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[min(480px,80dvh)] rounded-t-lg pb-[calc(16px+env(safe-area-inset-bottom))]"
        >
          <SheetHeader>
            <SheetTitle>{t("settings")}</SheetTitle>
          </SheetHeader>
          <SettingsPanel />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SortableRoutineRow({
  routine,
  checkedCount,
  completedLabel,
  unnamedLabel,
  dragLabel,
  onOpen,
}: {
  routine: Routine;
  checkedCount: number;
  completedLabel: string;
  unnamedLabel: string;
  dragLabel: string;
  onOpen: (routineId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: routine.id });

  return (
    <div
      className={`bg-card text-card-foreground has-[[data-main]:active]:bg-muted flex min-h-18 w-full items-center gap-0 rounded-lg py-0 pr-4 pl-2 text-left transition-colors ${
        isDragging ? "relative z-1 shadow-[0_8px_20px_oklch(0_0_0/20%)]" : ""
      }`}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <Button
        className="text-muted-foreground flex-none cursor-grab touch-none active:cursor-grabbing"
        variant="ghost"
        size="icon-sm"
        aria-label={dragLabel}
        {...attributes}
        {...listeners}
      >
        <GripVertical aria-hidden="true" />
      </Button>
      <button
        data-main="true"
        className="[&>svg]:text-muted-foreground flex min-h-18 min-w-0 flex-1 items-center gap-3.5 rounded-lg border-0 bg-transparent py-3.5 pr-0 pl-2 text-left text-inherit"
        onClick={() => onOpen(routine.id)}
      >
        <ProgressRing
          compact
          completed={checkedCount}
          total={routine.steps.length}
          ariaLabel={`${checkedCount} / ${routine.steps.length} ${completedLabel}`}
        />
        <span className="grid min-w-0 flex-1 gap-1.5">
          <strong className="font-heading overflow-hidden text-lg font-semibold text-ellipsis whitespace-nowrap">
            {routine.name || unnamedLabel}
          </strong>
        </span>
        <ChevronRight aria-hidden="true" />
      </button>
    </div>
  );
}
