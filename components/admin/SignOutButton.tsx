"use client";

import { useState } from "react";
import { clientApp } from "@/lib/firebase/client";

export function SignOutButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      className="btn-light !min-h-9 !py-1"
      onClick={async () => {
        setBusy(true);
        await fetch("/api/auth/session", { method: "DELETE" }).catch(() => undefined);
        const app = clientApp();
        if (app) {
          const { getAuth, signOut } = await import("firebase/auth");
          await signOut(getAuth(app)).catch(() => undefined);
        }
        window.location.assign("/admin/login");
      }}
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
