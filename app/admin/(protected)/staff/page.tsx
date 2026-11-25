import { requireStaffPage } from "@/lib/auth/session";
import { listStaff } from "@/app/admin/actions";
import { StaffManager } from "@/components/admin/StaffManager";

export const metadata = { title: "Staff" };

export default async function StaffPage() {
  const me = await requireStaffPage("owner");
  const res = await listStaff();
  return (
    <div className="space-y-6">
      <div><h1 className="text-[2.25rem] leading-tight font-semibold">Staff</h1><p className="mt-1 text-sage-600">People who can sign in to this admin, and what they can do.</p></div>
      {res.ok ? (
        <StaffManager initial={res.data} myUid={me.uid} />
      ) : (
        <p role="alert" className="rounded-[var(--radius-soft)] bg-red-50 p-3 text-red-700">
          Could not load staff.
        </p>
      )}
    </div>
  );
}
