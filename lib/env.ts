const bool = (v: string | undefined) => v === "true" || v === "1";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://derma-world-clinic.web.app").replace(/\/+$/, "");

export const flags = {
  notifyEmail: bool(process.env.NOTIFY_EMAIL_ENABLED),
  whatsappCloudApi: bool(process.env.WHATSAPP_CLOUD_API_ENABLED),
  ga4: bool(process.env.GA4_ENABLED) && !!process.env.NEXT_PUBLIC_GA4_ID,
  appCheckEnforced: bool(process.env.APP_CHECK_ENFORCED),
  emulators: bool(process.env.USE_FIREBASE_EMULATORS),
};

export const publicFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

export const isClientFirebaseConfigured = () => !!(publicFirebaseConfig.apiKey && publicFirebaseConfig.projectId);
