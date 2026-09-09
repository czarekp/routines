import {
  applyBackup,
  createBackup,
  parseBackup,
  type Backup,
} from "@/lib/backup";
import { SNAPSHOT_KEY } from "@/lib/storage-keys";

// Whether a snapshot exists is browser state the settings screen renders, so
// it is exposed as a store rather than synced into React state in an effect.
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeToUpdateSnapshot(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Cheap existence check — does not parse the stored backup. */
export function hasUpdateSnapshot(): boolean {
  try {
    return window.localStorage.getItem(SNAPSHOT_KEY) !== null;
  } catch {
    return false;
  }
}

export function hasNoUpdateSnapshotOnServer(): boolean {
  return false;
}

/**
 * Updating cannot lose data on its own — localStorage outlives a service-worker
 * swap. The snapshot is cheap insurance against the update itself going wrong,
 * and gives a one-tap way back.
 */
export function saveUpdateSnapshot(): Backup | null {
  try {
    const backup = createBackup();
    window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(backup));
    notify();
    return backup;
  } catch {
    return null;
  }
}

export function readUpdateSnapshot(): Backup | null {
  try {
    const stored = window.localStorage.getItem(SNAPSHOT_KEY);
    return stored ? parseBackup(stored) : null;
  } catch {
    return null;
  }
}

export function restoreUpdateSnapshot(): boolean {
  const snapshot = readUpdateSnapshot();
  if (!snapshot) return false;
  applyBackup(snapshot);
  return true;
}

export function discardUpdateSnapshot(): void {
  try {
    window.localStorage.removeItem(SNAPSHOT_KEY);
    notify();
  } catch {
    // Nothing to do — the snapshot is only ever a convenience.
  }
}

/**
 * Takes a snapshot, drops every cache, lets a waiting worker take over and
 * reloads. Cached responses are what make an installed PWA go stale, so
 * clearing them is the part that actually does the work.
 */
export async function updateApp(): Promise<void> {
  saveUpdateSnapshot();

  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      await registration?.update();
      registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
    } catch {
      // An unregistrable worker should not block the reload below.
    }
  }

  if ("caches" in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    } catch {
      // Same again: fall through to the reload.
    }
  }

  window.location.reload();
}
