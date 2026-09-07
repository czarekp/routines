import { Suspense } from "react";

import { RoutineEditRoute } from "@/app/routine/_components/routine-routes";

export default function RoutineEditPage() {
  return (
    <Suspense fallback={null}>
      <RoutineEditRoute />
    </Suspense>
  );
}
