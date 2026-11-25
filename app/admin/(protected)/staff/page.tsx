import { requireStaffPage } from "@/lib/auth/session";
import { listStaff } from "@/app/admin/actions";
import { StaffManager } from "@/components/admin/StaffManager";

export const metadata = { title: "Staff" };

export default async function StaffPage() {
  const me = await requireStaffPage("owner");
  const res = await listStaff();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Staff</h1>
      {res.ok ? (
        <StaffManager initial={res.data} myUid={me.uid} />
      ) : (
        <p role="alert" className="rounded-2xl bg-red-50 p-3 text-red-700">
          Could not load staff.
        </p>
      )}
    </div>
  );
}
