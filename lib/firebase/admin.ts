import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getAppCheck } from "firebase-admin/app-check";
import { flags } from "@/lib/env";

let app: App | null | undefined;

/** Returns the Admin app, or null when Firebase isn't configured. */
export function adminApp(): App | null {
  if (app !== undefined) return app;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || undefined;
  try {
    if (getApps().length) {
      app = getApps()[0]!;
    } else if (flags.emulators && projectId) {
      process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";
      process.env.FIREBASE_AUTH_EMULATOR_HOST ||= "127.0.0.1:9099";
      process.env.FIREBASE_STORAGE_EMULATOR_HOST ||= "127.0.0.1:9199";
      app = initializeApp({ projectId, storageBucket });
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const json = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON, "base64").toString("utf8"));
      app = initializeApp({ credential: cert(json), projectId: json.project_id, storageBucket });
    } else {
      app = null;
    }
  } catch (err) {
    console.error("[firebase-admin] init failed:", (err as Error).message);
    app = null;
  }
  return app;
}

export const isAdminConfigured = () => adminApp() !== null;

function need(): App {
  const a = adminApp();
  if (!a) throw new Error("Firebase Admin is not configured");
  return a;
}

/** Firestore database ID ("(default)" unless FIRESTORE_DATABASE_ID says otherwise). */
const DB_ID = process.env.FIRESTORE_DATABASE_ID || "(default)";
export const adminDb = () => getFirestore(need(), DB_ID);
export const adminAuth = () => getAuth(need());
export const adminStorage = () => getStorage(need());
export const adminAppCheck = () => getAppCheck(need());
