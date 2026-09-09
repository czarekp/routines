import { getRawData, replaceAllData } from "@/lib/storage";
import { LOCALE_KEY } from "@/lib/storage-keys";
import type { AppData, Routine, RoutineState, RoutineStep } from "@/types";

export const BACKUP_VERSION = 1;

export type Backup = {
  app: "routines";
  version: number;
  exportedAt: string;
  locale: string | null;
  data: AppData;
};

export class BackupError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseStep(value: unknown, index: number): RoutineStep | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.text !== "string") {
    return null;
  }
  return {
    id: value.id,
    text: value.text,
    order: typeof value.order === "number" ? value.order : index,
  };
}

function parseRoutine(value: unknown, index: number): Routine | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }
  const rawSteps = Array.isArray(value.steps) ? value.steps : [];
  return {
    id: value.id,
    name: value.name,
    order: typeof value.order === "number" ? value.order : index,
    steps: rawSteps
      .map(parseStep)
      .filter((step): step is RoutineStep => step !== null),
  };
}

function parseState(value: unknown): RoutineState {
  if (!isRecord(value)) return {};
  const state: RoutineState = {};

  for (const [routineId, progress] of Object.entries(value)) {
    if (!isRecord(progress)) continue;
    if (typeof progress.lastResetDate !== "string") continue;
    const checked = Array.isArray(progress.checkedStepIds)
      ? progress.checkedStepIds.filter(
          (id): id is string => typeof id === "string",
        )
      : [];
    state[routineId] = {
      checkedStepIds: checked,
      lastResetDate: progress.lastResetDate,
    };
  }

  return state;
}

/** Snapshots everything worth keeping, ready to be serialised to a file. */
export function createBackup(): Backup {
  let locale: string | null = null;
  try {
    locale = window.localStorage.getItem(LOCALE_KEY);
  } catch {
    // Storage can be unavailable; the backup is still worth taking.
  }

  return {
    app: "routines",
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    locale,
    data: getRawData(),
  };
}

/**
 * Validates a backup file. Import runs on a user-supplied file, so anything
 * unrecognised is dropped rather than trusted.
 */
export function parseBackup(text: string): Backup {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new BackupError("The file is not valid JSON.");
  }

  if (!isRecord(parsed) || parsed.app !== "routines") {
    throw new BackupError("The file is not a Routines backup.");
  }
  if (parsed.version !== BACKUP_VERSION) {
    throw new BackupError("The backup was made by a different app version.");
  }
  if (!isRecord(parsed.data) || !Array.isArray(parsed.data.routines)) {
    throw new BackupError("The backup does not contain any routines.");
  }

  const routines = parsed.data.routines
    .map(parseRoutine)
    .filter((routine): routine is Routine => routine !== null);

  return {
    app: "routines",
    version: BACKUP_VERSION,
    exportedAt:
      typeof parsed.exportedAt === "string"
        ? parsed.exportedAt
        : new Date().toISOString(),
    locale: typeof parsed.locale === "string" ? parsed.locale : null,
    data: { routines, state: parseState(parsed.data.state) },
  };
}

/** Overwrites the current routines with the backup's. */
export function applyBackup(backup: Backup): void {
  replaceAllData(backup.data);
  if (backup.locale === "pl" || backup.locale === "en") {
    try {
      window.localStorage.setItem(LOCALE_KEY, backup.locale);
    } catch {
      // The routines still imported; only the language preference is lost.
    }
  }
}

export function backupFileName(date = new Date()): string {
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
  return `routines-backup-${stamp}.json`;
}

/** Hands the browser a JSON file to save. */
export function downloadBackup(backup: Backup = createBackup()): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = backupFileName(new Date(backup.exportedAt));
  document.body.append(link);
  link.click();
  link.remove();
  // Revoking straight away can cancel the download in some browsers.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
