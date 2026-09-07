import { Suspense } from "react";

import { RoutineDetailRoute } from "@/app/routine/_components/routine-routes";

export default function RoutinePage() {
  return (
    <Suspense fallback={null}>
      <RoutineDetailRoute />
    </Suspense>
  );
}
