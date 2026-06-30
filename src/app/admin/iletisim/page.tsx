import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AdminContactPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">İletişim Mesajları</h1>
        <p className="text-sm text-gray-500">
          {messages.filter((m) => !m.isRead).length} okunmamış mesaj
        </p>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="card p-8 text-center text-gray-500">Henüz mesaj yok</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`card p-5 ${!msg.isRead ? "border-l-4 border-brand" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{msg.name}</p>
                  <p className="text-sm text-gray-500">{msg.email}</p>
                  {msg.phone && <p className="text-sm text-gray-400">{msg.phone}</p>}
                </div>
                <span className="text-xs text-gray-400">{formatDate(msg.createdAt)}</span>
              </div>
              {msg.subject && (
                <p className="font-medium text-sm mt-3">{msg.subject}</p>
              )}
              <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{msg.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
