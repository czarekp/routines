import { startTransition } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { MissingRoutine } from "@/components/missing-routine";
import { RoutineEditForm } from "@/components/routine-edit-form";
import { useRoutines } from "@/hooks/use-store";
import { useTranslation } from "@/i18n/use-translation";
import { deleteRoutine, saveRoutine } from "@/lib/storage";

export function RoutineEditView() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const routineId = searchParams.get("id");
  const routines = useRoutines();
  const routine = routineId
    ? (routines.find((item) => item.id === routineId) ?? null)
    : null;

  if (!routine) return <MissingRoutine />;
  return (
    <RoutineEditForm
      routine={routine}
      title={t("editTitle")}
      onBack={() =>
        startTransition(() =>
          navigate(`/routine?id=${encodeURIComponent(routine.id)}`),
        )
      }
      onSave={saveRoutine}
      onDelete={() => {
        deleteRoutine(routine.id);
        startTransition(() => navigate("/"));
      }}
    />
  );
}
