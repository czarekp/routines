"use client";

import { useSyncExternalStore } from "react";

import {
  getServerSettingsSnapshot,
  getSettingsSnapshot,
  subscribeToSettings,
  type AppSettings,
} from "@/lib/settings";
import {
  getRoutinesSnapshot,
  getServerRoutinesSnapshot,
  getServerStateSnapshot,
  getStateSnapshot,
  subscribe,
} from "@/lib/storage";
import type { Routine, RoutineState } from "@/types";

export function useRoutines(): Routine[] {
  return useSyncExternalStore(
    subscribe,
    getRoutinesSnapshot,
    getServerRoutinesSnapshot,
  );
}

export function useRoutineState(): RoutineState {
  return useSyncExternalStore(
    subscribe,
    getStateSnapshot,
    getServerStateSnapshot,
  );
}

export function useAppSettings(): AppSettings {
  return useSyncExternalStore(
    subscribeToSettings,
    getSettingsSnapshot,
    getServerSettingsSnapshot,
  );
}
