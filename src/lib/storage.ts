import type { AppData, Routine, RoutineState } from "@/types";

const STORAGE_KEY = "routines-data";

const emptyData: AppData = { routines: [], state: {} };

function today(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function readData(): AppData {
  if (typeof window === "undefined") {
    return emptyData;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return emptyData;
    }

    const parsed = JSON.parse(stored) as Partial<AppData>;
    return {
      routines: Array.isArray(parsed.routines) ? parsed.routines : [],
      state:
        parsed.state && typeof parsed.state === "object" ? parsed.state : {},
    };
  } catch {
    return emptyData;
  }
}

function writeData(data: AppData): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function normalizeState(data: AppData): AppData {
  const currentDate = today();
  let changed = false;
  const state: RoutineState = { ...data.state };

  for (const routine of data.routines) {
    const routineState = state[routine.id];
    if (!routineState || routineState.lastResetDate !== currentDate) {
      state[routine.id] = { checkedStepIds: [], lastResetDate: currentDate };
      changed = true;
    }
  }

  const normalized = { routines: data.routines, state };
  if (changed) {
    writeData(normalized);
  }

  return normalized;
}

function withOrderedRoutines(routines: Routine[]): Routine[] {
  return routines
    .map((routine, index) => ({ ...routine, order: index }))
    .sort((left, right) => left.order - right.order);
}

export function getRoutines(): Routine[] {
  return withOrderedRoutines(normalizeState(readData()).routines);
}

export function getState(): RoutineState {
  return normalizeState(readData()).state;
}

export function saveRoutine(routine: Routine): void {
  const data = normalizeState(readData());
  const existingIndex = data.routines.findIndex(
    (item) => item.id === routine.id,
  );
  const routines = [...data.routines];

  if (existingIndex === -1) {
    routines.push({ ...routine, order: routines.length });
  } else {
    routines[existingIndex] = routine;
  }

  writeData({ ...data, routines: withOrderedRoutines(routines) });
}

export function deleteRoutine(routineId: string): void {
  const data = normalizeState(readData());
  const routines = withOrderedRoutines(
    data.routines.filter((routine) => routine.id !== routineId),
  );
  const state = { ...data.state };
  delete state[routineId];
  writeData({ routines, state });
}

export function toggleStep(routineId: string, stepId: string): RoutineState {
  const data = normalizeState(readData());
  const routineState = data.state[routineId] ?? {
    checkedStepIds: [],
    lastResetDate: today(),
  };
  const isChecked = routineState.checkedStepIds.includes(stepId);
  const checkedStepIds = isChecked
    ? routineState.checkedStepIds.filter((id) => id !== stepId)
    : [...routineState.checkedStepIds, stepId];
  const state = {
    ...data.state,
    [routineId]: { checkedStepIds, lastResetDate: today() },
  };

  writeData({ ...data, state });
  return state;
}

export function resetRoutine(routineId: string): RoutineState {
  const data = normalizeState(readData());
  const state = {
    ...data.state,
    [routineId]: { checkedStepIds: [], lastResetDate: today() },
  };
  writeData({ ...data, state });
  return state;
}

export function resetAll(): RoutineState {
  const data = normalizeState(readData());
  const currentDate = today();
  const state = Object.fromEntries(
    data.routines.map((routine) => [
      routine.id,
      { checkedStepIds: [], lastResetDate: currentDate },
    ]),
  );
  writeData({ ...data, state });
  return state;
}
