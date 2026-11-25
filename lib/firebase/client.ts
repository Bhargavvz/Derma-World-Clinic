"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { isClientFirebaseConfigured, publicFirebaseConfig } from "@/lib/env";

/** Lazily initialised Firebase client app (only loaded on Appointment/Contact and admin). */
export function clientApp(): FirebaseApp | null {
  if (!isClientFirebaseConfigured()) return null;
  return getApps().length ? getApp() : initializeApp(publicFirebaseConfig);
}

let appCheckPromise: Promise<import("firebase/app-check").AppCheck | null> | null = null;

async function appCheck() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;
  const app = clientApp();
  if (!app || !siteKey) return null;
  appCheckPromise ??= import("firebase/app-check").then(({ initializeAppCheck, ReCaptchaEnterpriseProvider }) =>
    initializeAppCheck(app, { provider: new ReCaptchaEnterpriseProvider(siteKey), isTokenAutoRefreshEnabled: true }),
  );
  return appCheckPromise;
}

/** Returns an App Check token, or null when not configured / unavailable. */
export async function getAppCheckToken(): Promise<string | null> {
  try {
    const ac = await appCheck();
    if (!ac) return null;
    const { getToken } = await import("firebase/app-check");
    return (await getToken(ac, false)).token;
  } catch {
    return null;
  }
}

/** Warm up App Check early (e.g. when the form mounts). */
export function preloadAppCheck() {
  void appCheck().catch(() => null);
}
