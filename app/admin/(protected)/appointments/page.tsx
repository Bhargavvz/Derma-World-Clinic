import { listAppointments } from "@/app/admin/actions";
import { requireStaffPage } from "@/lib/auth/session";
import { AppointmentsTable } from "@/components/admin/AppointmentsTable";

export const metadata = { title: "Appointments" };

export default async function AppointmentsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const user = await requireStaffPage();
  const res = await listAppointments();
  const { id } = await searchParams;
  return (
    <AppointmentsTable
      initial={res.ok ? res.data : []}
      loadError={!res.ok}
      isOwner={user.role === "owner"}
      openId={id ?? null}
    />
  );
}
