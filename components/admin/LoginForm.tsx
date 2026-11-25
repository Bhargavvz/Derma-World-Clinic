"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { clientApp } from "@/lib/firebase/client";

type Msg = { tone: "error" | "info"; text: string } | null;

const MESSAGES = {
  empty: "Please enter your email and password.",
  wrong: "Wrong email or password.",
  noAccess: "This account doesn't have access.",
  unverified: "Please verify your email address first. We've sent you a verification email.",
  network: "Sign-in failed. Please check your connection and try again.",
  notConfigured: "Sign-in is not configured (Firebase settings missing).",
  resetSent: "If an account exists for that email, a password reset email has been sent.",
  resetNeedsEmail: "Enter your email address above, then choose “Forgot password?”.",
};

async function auth() {
  const app = clientApp();
  if (!app) return null;
  const mod = await import("firebase/auth");
  const a = mod.getAuth(app);
  if (process.env.NEXT_PUBLIC_USE_AUTH_EMULATOR === "true" && !(a as unknown as { _emulatorConfig?: unknown })._emulatorConfig) {
    mod.connectAuthEmulator(a, "http://127.0.0.1:9099", { disableWarnings: true });
  }
  return { a, mod };
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  async function exchange(getToken: (force: boolean) => Promise<string>, onUnverified?: () => Promise<void>): Promise<void> {
    let res = await post(await getToken(false));
    if (res === "refresh") res = await post(await getToken(true));
    if (res === "ok") {
      router.replace("/admin");
      router.refresh();
      return;
    }
    const s = await auth();
    if (s) await s.mod.signOut(s.a);
    if (res === "unverified") {
      await onUnverified?.();
      setMsg({ tone: "error", text: MESSAGES.unverified });
    } else if (res === "no_access") setMsg({ tone: "error", text: MESSAGES.noAccess });
    else setMsg({ tone: "error", text: MESSAGES.network });
  }

  async function post(idToken: string): Promise<string> {
    const r = await fetch("/api/auth/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) });
    const j = (await r.json().catch(() => ({}))) as { status?: string };
    return j.status ?? "error";
  }

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return setMsg({ tone: "error", text: MESSAGES.empty });
    setBusy(true);
    setMsg(null);
    try {
      const s = await auth();
      if (!s) return setMsg({ tone: "error", text: MESSAGES.notConfigured });
      const cred = await s.mod.signInWithEmailAndPassword(s.a, email.trim(), password);
      await exchange(
        (f) => cred.user.getIdToken(f),
        () => s.mod.sendEmailVerification(cred.user),
      );
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setMsg({
        tone: "error",
        text: /invalid-credential|wrong-password|user-not-found|invalid-email/.test(code) ? MESSAGES.wrong : MESSAGES.network,
      });
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setBusy(true);
    setMsg(null);
    try {
      const s = await auth();
      if (!s) return setMsg({ tone: "error", text: MESSAGES.notConfigured });
      const cred = await s.mod.signInWithPopup(s.a, new s.mod.GoogleAuthProvider());
      await exchange((f) => cred.user.getIdToken(f));
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      if (!/popup-closed|cancelled-popup/.test(code)) setMsg({ tone: "error", text: MESSAGES.network });
    } finally {
      setBusy(false);
    }
  }

  async function onReset() {
    if (!email.trim()) return setMsg({ tone: "info", text: MESSAGES.resetNeedsEmail });
    try {
      const s = await auth();
      if (!s) return setMsg({ tone: "error", text: MESSAGES.notConfigured });
      await s.mod.sendPasswordResetEmail(s.a, email.trim()).catch(() => undefined);
      setMsg({ tone: "info", text: MESSAGES.resetSent });
    } catch {
      setMsg({ tone: "error", text: MESSAGES.network });
    }
  }

  return (
    <div className="card space-y-5">
      {msg && (
        <p role={msg.tone === "error" ? "alert" : "status"} className={`rounded-2xl p-3 text-sm ${msg.tone === "error" ? "bg-red-50 text-red-700" : "bg-brand-50 text-brand-800"}`}>
          {msg.text}
        </p>
      )}
      <form onSubmit={onEmail} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input id="email" type="email" autoComplete="username" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input id="password" type="password" autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <button type="button" onClick={onReset} className="text-sm font-semibold text-brand-700 underline">
        Forgot password?
      </button>
      <div className="flex items-center gap-3 text-xs text-gray-500" aria-hidden="true">
        <span className="h-px flex-1 bg-sage-200" /> or <span className="h-px flex-1 bg-sage-200" />
      </div>
      <button type="button" onClick={onGoogle} className="btn-secondary w-full" disabled={busy}>
        Continue with Google
      </button>
    </div>
  );
}
