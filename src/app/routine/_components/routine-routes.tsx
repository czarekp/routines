"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useState } from "react";

import { RoutineDetail } from "@/app/routine/_components/routine-detail";
import { RoutineEdit } from "@/app/routine/_components/routine-edit";
import { createId } from "@/lib/routine-utils";
import {
  deleteRoutine,
  resetRoutine,
  saveRoutine,
  toggleStep,
} from "@/lib/storage";
import { useRoutines, useRoutineState } from "@/lib/use-store";
import type { Routine } from "@/types";

export function NewRoutineRoute() {
  const router = useRouter();
  const t = useTranslations();
  const routines = useRoutines();
  const [routine, setRoutine] = useState<Routine | null>(null);

  useEffect(() => {
    const newRoutine: Routine = {
      id: createId(),
      name: "",
      order: routines.length,
      steps: [],
    };
    startTransition(() => setRoutine(newRoutine));
    // Only seed the draft once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!routine) return null;
  return (
    <RoutineEdit
      routine={routine}
      title={t("newRoutineTitle")}
      onBack={() => router.push("/")}
      onSave={saveRoutine}
      onComplete={() =>
        router.push(`/routine?id=${encodeURIComponent(routine.id)}`)
      }
      onDelete={() => router.push("/")}
      showDelete={false}
    />
  );
}

export function RoutineDetailRoute() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routineId = searchParams.get("id");
  const routines = useRoutines();
  const state = useRoutineState();
  const routine = routineId
    ? (routines.find((item) => item.id === routineId) ?? null)
    : null;

  if (!routine) return <MissingRoute />;
  return (
    <RoutineDetail
      routine={routine}
      progress={state[routine.id]}
      onBack={() => router.push("/")}
      onEdit={() =>
        router.push(`/routine/edit?id=${encodeURIComponent(routine.id)}`)
      }
      onToggle={(_, stepId) => toggleStep(routine.id, stepId)}
      onReset={() => resetRoutine(routine.id)}
    />
  );
}

export function RoutineEditRoute() {
  const router = useRouter();
  const t = useTranslations();
  const searchParams = useSearchParams();
  const routineId = searchParams.get("id");
  const routines = useRoutines();
  const routine = routineId
    ? (routines.find((item) => item.id === routineId) ?? null)
    : null;

  if (!routine) return <MissingRoute />;
  return (
    <RoutineEdit
      routine={routine}
      title={t("editTitle")}
      onBack={() =>
        router.push(`/routine?id=${encodeURIComponent(routine.id)}`)
      }
      onSave={saveRoutine}
      onDelete={() => {
        deleteRoutine(routine.id);
        router.push("/");
      }}
    />
  );
}

export function MissingRoute() {
  const t = useTranslations();
  return (
    <div className="mx-auto min-h-dvh w-[min(100%,480px)] px-5 pt-5 pb-10">
      <p>{t("routineNotFound")}</p>
    </div>
  );
}
