import { listMessages } from "@/app/admin/actions";
import { MessagesList } from "@/components/admin/MessagesList";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const res = await listMessages();
  return (
    <div className="space-y-6">
      <div><h1 className="text-[2.25rem] leading-tight font-semibold">Messages</h1><p className="mt-1 text-sage-600">Questions sent from the contact form. Mark each one replied once you have answered it.</p></div>
      {!res.ok ? (
        <p role="alert" className="rounded-[var(--radius-soft)] bg-red-50 p-3 text-red-700">
          Could not load messages. Please refresh.
        </p>
      ) : (
        <MessagesList initial={res.data} />
      )}
    </div>
  );
}
