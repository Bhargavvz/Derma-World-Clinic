import { requireStaffPage } from "@/lib/auth/session";
import { listAudit } from "@/app/admin/actions";
import { formatDateTime } from "@/lib/dates";

export const metadata = { title: "Audit log" };

export default async function AuditPage() {
  await requireStaffPage("owner");
  const res = await listAudit();
  return (
    <div className="space-y-6">
      <div><h1 className="text-[2.25rem] leading-tight font-semibold">Audit log</h1><p className="mt-1 text-sage-600">Every change made in the admin, newest first.</p></div>
      {!res.ok ? (
        <p role="alert" className="rounded-[var(--radius-soft)] bg-red-50 p-3 text-red-700">
          Could not load the audit log.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-frame)] border border-sage-200 bg-white">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Recent changes, newest first</caption>
            <thead className="bg-sage-100">
              <tr>
                <th className="p-3">When</th>
                <th className="p-3">Who</th>
                <th className="p-3">Action</th>
                <th className="p-3">Target</th>
                <th className="p-3">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
              {res.data.map((r) => (
                <tr key={r.id}>
                  <td className="p-3 whitespace-nowrap">{r.at ? formatDateTime(r.at) : ""}</td>
                  <td className="p-3 break-all">{r.actorEmail}</td>
                  <td className="p-3">{r.action}</td>
                  <td className="p-3 break-all">{r.target}</td>
                  <td className="p-3">{r.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
