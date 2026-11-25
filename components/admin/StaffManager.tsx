"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cancelInvite, changeStaffRole, inviteStaff, revokeStaff, type InviteRow, type StaffRow } from "@/app/admin/actions";
import type { StaffRole } from "@/lib/content/types";
import { formatDateTime } from "@/lib/dates";

export function StaffManager({ initial, myUid }: { initial: { staff: StaffRow[]; invites: InviteRow[] }; myUid: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("staff");
  const [msg, setMsg] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);

  async function invite(e: FormEvent) {
    e.preventDefault();
    setLink(null);
    const res = await inviteStaff(email, role);
    if (res.ok) {
      setMsg(`Invitation saved for ${email} (valid for 7 days). They can sign in with Google, or set a password with the link below.`);
      setLink(res.data.setupLink);
      setEmail("");
      router.refresh();
    } else setMsg("Could not invite. Check the email address.");
  }

  return (
    <div className="space-y-8">
      <form onSubmit={invite} className="card grid gap-4 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="inv-email" className="label">
            Invite by email
          </label>
          <input id="inv-email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="inv-role" className="label">
            Role
          </label>
          <select id="inv-role" className="input" value={role} onChange={(e) => setRole(e.target.value as StaffRole)}>
            <option value="staff">staff</option>
            <option value="owner">owner</option>
          </select>
        </div>
        <button type="submit" className="btn-primary">
          Invite
        </button>
      </form>
      {msg && (
        <div role="status" className="rounded-[var(--radius-soft)] bg-brand-50 p-4 text-sm text-brand-800">
          <p>{msg}</p>
          {link && (
            <p className="mt-2 break-all">
              Set-password link (share privately): <code>{link}</code>
            </p>
          )}
        </div>
      )}

      <section className="card">
        <h2 className="text-xl font-semibold">Team</h2>
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Sign-in</th>
              <th className="p-2">Last login</th>
              <th className="p-2">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage-100">
            {initial.staff.map((s) => (
              <tr key={s.uid}>
                <td className="p-2 break-all">{s.email}</td>
                <td className="p-2">
                  {s.uid === myUid ? (
                    s.role
                  ) : (
                    <select
                      aria-label={`Role for ${s.email}`}
                      className="input !min-h-9 !py-1"
                      defaultValue={s.role}
                      onChange={async (e) => {
                        const r = await changeStaffRole(s.uid, e.target.value as StaffRole);
                        setMsg(r.ok ? `Role updated for ${s.email}. They'll need to sign in again.` : "Could not change the role.");
                        router.refresh();
                      }}
                    >
                      <option value="staff">staff</option>
                      <option value="owner">owner</option>
                    </select>
                  )}
                </td>
                <td className="p-2">{s.providers.join(", ")}</td>
                <td className="p-2">{s.lastLoginAt ? formatDateTime(s.lastLoginAt) : "—"}</td>
                <td className="p-2">
                  {s.uid !== myUid && (
                    <button
                      type="button"
                      className="text-red-700 underline"
                      onClick={async () => {
                        if (!window.confirm(`Revoke access for ${s.email}? They will be signed out everywhere.`)) return;
                        const r = await revokeStaff(s.uid);
                        setMsg(r.ok ? `Access revoked for ${s.email}.` : "Could not revoke access.");
                        router.refresh();
                      }}
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold">Pending invitations</h2>
        {initial.invites.length === 0 ? (
          <p className="mt-2 text-sm text-sage-600">None.</p>
        ) : (
          <ul className="mt-3 divide-y divide-sage-100 text-sm">
            {initial.invites.map((i) => (
              <li key={i.email} className="flex flex-wrap justify-between gap-2 py-2">
                <span>
                  {i.email} · {i.role} · expires {i.expiresAt ? formatDateTime(i.expiresAt) : "?"}
                </span>
                <button
                  type="button"
                  className="text-red-700 underline"
                  onClick={async () => {
                    await cancelInvite(i.email);
                    router.refresh();
                  }}
                >
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
