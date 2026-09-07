import type { RoutineStep } from "@/types";

export function createId(): string {
  return crypto.randomUUID();
}

export function sortSteps(steps: RoutineStep[]): RoutineStep[] {
  return [...steps].sort((left, right) => left.order - right.order);
}
