export type RoutineStep = {
  id: string;
  text: string;
  order: number;
};

export type Routine = {
  id: string;
  name: string;
  order: number;
  steps: RoutineStep[];
};

export type RoutineProgress = {
  checkedStepIds: string[];
  lastResetDate: string;
};

export type RoutineState = Record<string, RoutineProgress>;

export type AppData = {
  routines: Routine[];
  state: RoutineState;
};
