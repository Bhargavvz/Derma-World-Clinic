"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { clientApp } from "@/lib/firebase/client";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      className={compact ? "btn-secondary !min-h-10 !px-3" : "btn-secondary w-full !min-h-10"}
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
      <LogOut className="h-4 w-4" aria-hidden="true" />
      <span className={compact ? "sr-only" : undefined}>{busy ? "Signing out…" : "Sign out"}</span>
    </button>
  );
}
