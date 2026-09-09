import {
  clearLockEnrolment,
  setLockEnrolment,
  type LockEnrolment,
} from "@/lib/settings";

// The app lock is a convenience gate, not encryption. There is no backend, so
// nothing verifies the WebAuthn assertion and routines stay readable in
// localStorage. It keeps a casual passer-by out of an unlocked phone; it does
// not protect the data itself. The settings screen says so in as many words.
//
// WebAuthn cannot request a specific biometric. `userVerification: "required"
// asks the platform to verify the user and the OS picks how — fingerprint,
// face, PIN or pattern. The UI says "fingerprint" because that is what this
// app is used with; there is no API to enforce it.

const RP_NAME = "Routines";
const USER_NAME = "Routines";

// Whether this session has already passed the lock. In memory only, so
// closing the app locks it again. Enrolling counts as passing: the user just
// completed the very same platform prompt.
let sessionUnlocked = false;
const unlockListeners = new Set<() => void>();

export function subscribeToUnlock(listener: () => void): () => void {
  unlockListeners.add(listener);
  return () => {
    unlockListeners.delete(listener);
  };
}

export function isSessionUnlocked(): boolean {
  return sessionUnlocked;
}

export function isLockedOnServer(): boolean {
  return false;
}

function markSessionUnlocked(): void {
  sessionUnlocked = true;
  for (const listener of unlockListeners) {
    listener();
  }
}

function toBase64Url(buffer: ArrayBuffer): string {
  let binary = "";
  for (const byte of new Uint8Array(buffer)) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// WebAuthn wants a `BufferSource` backed by a plain ArrayBuffer, so both helpers
// below pin the element type rather than returning `ArrayBufferLike`.
function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(length));
}

/** True when this browser has a built-in authenticator it can prompt for. */
export async function isAppLockSupported(): Promise<boolean> {
  if (
    typeof window === "undefined" ||
    !window.isSecureContext ||
    typeof window.PublicKeyCredential === "undefined"
  ) {
    return false;
  }
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * Registers a platform credential and stores its handle. Resolves to the
 * enrolment on success; throws if the user cancels or the platform refuses.
 */
export async function enrolAppLock(): Promise<LockEnrolment> {
  const userId = randomBytes(16);
  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge: randomBytes(32),
      rp: { name: RP_NAME },
      user: { id: userId, name: USER_NAME, displayName: RP_NAME },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60_000,
      attestation: "none",
    },
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error("The device did not return a credential.");
  }

  const enrolment: LockEnrolment = {
    credentialId: toBase64Url(credential.rawId),
    userId: toBase64Url(userId.buffer),
    createdAt: new Date().toISOString(),
  };
  setLockEnrolment(enrolment);
  markSessionUnlocked();
  return enrolment;
}

/**
 * Prompts for the platform authenticator. Resolves true when the user passed
 * the check, false when they cancelled or the credential is gone.
 */
export async function verifyAppLock(
  enrolment: LockEnrolment,
): Promise<boolean> {
  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: randomBytes(32),
        allowCredentials: [
          {
            type: "public-key",
            id: fromBase64Url(enrolment.credentialId),
          },
        ],
        userVerification: "required",
        timeout: 60_000,
      },
    });
    if (assertion === null) return false;
    markSessionUnlocked();
    return true;
  } catch {
    return false;
  }
}

export function disableAppLock(): void {
  clearLockEnrolment();
  markSessionUnlocked();
}
