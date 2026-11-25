import { listMessages } from "@/app/admin/actions";
import { MessagesList } from "@/components/admin/MessagesList";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const res = await listMessages();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Contact messages</h1>
      {!res.ok ? (
        <p role="alert" className="rounded-2xl bg-red-50 p-3 text-red-700">
          Could not load messages. Please refresh.
        </p>
      ) : (
        <MessagesList initial={res.data} />
      )}
    </div>
  );
}
