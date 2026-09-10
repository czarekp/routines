import { startTransition } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { MissingRoutine } from "@/components/missing-routine";
import { useRoutines, useRoutineState } from "@/hooks/use-store";
import { resetRoutine, toggleStep } from "@/lib/storage";
import { RoutineDetail } from "@/views/routine/routine-detail";

export function RoutineView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routineId = searchParams.get("id");
  const routines = useRoutines();
  const state = useRoutineState();
  const routine = routineId
    ? (routines.find((item) => item.id === routineId) ?? null)
    : null;

  if (!routine) return <MissingRoutine />;
  return (
    <RoutineDetail
      routine={routine}
      progress={state[routine.id]}
      onBack={() => startTransition(() => navigate("/"))}
      onEdit={() =>
        startTransition(() =>
          navigate(`/routine/edit?id=${encodeURIComponent(routine.id)}`),
        )
      }
      onToggle={(_, stepId) => toggleStep(routine.id, stepId)}
      onReset={() => resetRoutine(routine.id)}
    />
  );
}
