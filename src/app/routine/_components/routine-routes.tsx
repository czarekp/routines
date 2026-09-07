"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useState } from "react";

import { RoutineDetail } from "@/app/routine/_components/routine-detail";
import { RoutineEdit } from "@/app/routine/_components/routine-edit";
import { SettingsScreen } from "@/app/settings/_components/settings-screen";
import { createId } from "@/lib/routine-utils";
import {
  deleteRoutine,
  getRoutines,
  getState,
  resetRoutine,
  saveRoutine,
  toggleStep,
} from "@/lib/storage";
import type { Routine, RoutineProgress } from "@/types";

export function SettingsRoute() {
  const router = useRouter();
  return <SettingsScreen onBack={() => router.push("/")} />;
}

export function NewRoutineRoute() {
  const router = useRouter();
  const t = useTranslations();
  const [routine, setRoutine] = useState<Routine | null>(null);

  useEffect(() => {
    const newRoutine: Routine = {
      id: createId(),
      name: "",
      order: getRoutines().length,
      steps: [],
    };
    startTransition(() => setRoutine(newRoutine));
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
      requireComplete
    />
  );
}

export function RoutineDetailRoute() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routineId = searchParams.get("id");
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [progress, setProgress] = useState<RoutineProgress | undefined>();

  useEffect(() => {
    if (!routineId) return;
    startTransition(() => {
      setRoutine(getRoutines().find((item) => item.id === routineId) ?? null);
      setProgress(getState()[routineId]);
    });
  }, [routineId]);

  if (!routine) return null;
  return (
    <RoutineDetail
      routine={routine}
      progress={progress}
      onBack={() => router.push("/")}
      onEdit={() =>
        router.push(`/routine/edit?id=${encodeURIComponent(routine.id)}`)
      }
      onToggle={(_, stepId) =>
        setProgress(toggleStep(routine.id, stepId)[routine.id])
      }
      onReset={() => setProgress(resetRoutine(routine.id)[routine.id])}
    />
  );
}

export function RoutineEditRoute() {
  const router = useRouter();
  const t = useTranslations();
  const searchParams = useSearchParams();
  const routineId = searchParams.get("id");
  const [routine, setRoutine] = useState<Routine | null>(null);

  useEffect(() => {
    if (!routineId) return;
    startTransition(() =>
      setRoutine(getRoutines().find((item) => item.id === routineId) ?? null),
    );
  }, [routineId]);

  if (!routine) return null;
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
    <div className="app-shell">
      <p>{t("routineNotFound")}</p>
    </div>
  );
}
