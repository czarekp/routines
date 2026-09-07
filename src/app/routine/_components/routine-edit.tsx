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
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ChangeEvent, useEffect, useRef, useState } from "react";

import { AppBar } from "@/app/_components/app-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createId, sortSteps } from "@/lib/routine-utils";
import type { Routine, RoutineStep } from "@/types";

export function RoutineEdit({
  routine,
  title,
  onBack,
  onSave,
  onDelete,
  onComplete,
  showDelete = true,
}: {
  routine: Routine;
  title: string;
  onBack: () => void;
  onSave: (routine: Routine) => void;
  onDelete: () => void;
  onComplete?: () => void;
  showDelete?: boolean;
}) {
  const t = useTranslations();
  const [name, setName] = useState(routine.name);
  const [steps, setSteps] = useState(sortSteps(routine.steps));
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [focusStepId, setFocusStepId] = useState<string | null>(null);
  const canSave =
    name.trim().length > 0 && steps.some((step) => step.text.trim().length > 0);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
  );

  function updateStep(stepId: string, text: string) {
    setSteps((current) =>
      current.map((step) => (step.id === stepId ? { ...step, text } : step)),
    );
  }

  function addStep() {
    const id = createId();
    setSteps((current) => [
      ...current,
      { id, text: "", order: current.length },
    ]);
    setFocusStepId(id);
  }

  function removeStep(stepId: string) {
    setSteps((current) =>
      current
        .filter((step) => step.id !== stepId)
        .map((step, index) => ({ ...step, order: index })),
    );
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const oldIndex = steps.findIndex((step) => step.id === active.id);
    const newIndex = steps.findIndex((step) => step.id === over.id);
    setSteps(
      arrayMove(steps, oldIndex, newIndex).map((step, index) => ({
        ...step,
        order: index,
      })),
    );
  }

  function save() {
    onSave({
      ...routine,
      name: name.trim(),
      steps: steps.map((step, index) => ({
        ...step,
        text: step.text.trim(),
        order: index,
      })),
    });
    (onComplete ?? onBack)();
  }

  return (
    <div className="app-shell routine-edit-screen">
      <AppBar title={title} onBack={onBack} />
      <section className="edit-form">
        <label htmlFor="routine-name">{t("routineName")}</label>
        <Input
          id="routine-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t("routineNamePlaceholder")}
          autoFocus
        />
      </section>
      <section className="edit-steps">
        <div className="section-heading">
          <h2>{t("stepsTitle")}</h2>
          <span>{steps.length}</span>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={steps.map((step) => step.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="edit-step-list">
              {steps.map((step, index) => (
                <SortableStepRow
                  key={step.id}
                  step={step}
                  placeholder={t("addStepPlaceholder")}
                  stepLabel={t("stepNumber", { number: index + 1 })}
                  dragLabel={t("dragStep")}
                  deleteLabel={t("deleteStep")}
                  autoFocus={step.id === focusStepId}
                  onChange={updateStep}
                  onDelete={removeStep}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <Button variant="outline" className="add-step" onClick={addStep}>
          <Plus /> {t("addStep")}
        </Button>
      </section>
      {showDelete && (
        <Button
          variant="destructive"
          className="delete-routine"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 /> {t("deleteRoutine")}
        </Button>
      )}
      <div className="fixed-done-bar">
        <Button
          className="fixed-done-button"
          disabled={!canSave}
          onClick={save}
        >
          {t("done")}
        </Button>
      </div>
      <Sheet open={deleteOpen} onOpenChange={setDeleteOpen}>
        <SheetContent side="bottom" className="delete-sheet">
          <SheetHeader>
            <SheetTitle>{t("deleteRoutineTitle")}</SheetTitle>
            <SheetDescription>{t("deleteRoutineDescription")}</SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              {t("deleteRoutine")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SortableStepRow({
  step,
  placeholder,
  stepLabel,
  dragLabel,
  deleteLabel,
  autoFocus = false,
  onChange,
  onDelete,
}: {
  step: RoutineStep;
  placeholder: string;
  stepLabel: string;
  dragLabel: string;
  deleteLabel: string;
  autoFocus?: boolean;
  onChange: (stepId: string, text: string) => void;
  onDelete: (stepId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  return (
    <div
      className={`edit-step-row ${isDragging ? "edit-step-row-dragging" : ""}`}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <Button
        className="drag-handle"
        variant="ghost"
        size="icon-sm"
        aria-label={dragLabel}
        {...attributes}
        {...listeners}
      >
        <GripVertical aria-hidden="true" />
      </Button>
      <Input
        ref={inputRef}
        value={step.text}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(step.id, event.target.value)
        }
        placeholder={placeholder}
        aria-label={stepLabel}
      />
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={deleteLabel}
        onClick={() => onDelete(step.id)}
      >
        <Trash2 />
      </Button>
    </div>
  );
}
