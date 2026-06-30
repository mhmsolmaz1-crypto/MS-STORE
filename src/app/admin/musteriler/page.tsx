import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Müşteriler</h1>
        <p className="text-sm text-gray-500">{customers.length} kayıtlı müşteri</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4">Ad Soyad</th>
              <th className="text-left p-4">E-posta</th>
              <th className="text-left p-4">Telefon</th>
              <th className="text-left p-4">Tip</th>
              <th className="text-left p-4">Sipariş</th>
              <th className="text-left p-4">Kayıt</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{c.firstName} {c.lastName}</td>
                <td className="p-4">{c.email}</td>
                <td className="p-4">{c.phone ?? "—"}</td>
                <td className="p-4">
                  <span className="badge bg-gray-100">
                    {c.isCorporate ? "Kurumsal" : "Bireysel"}
                  </span>
                </td>
                <td className="p-4">{c._count.orders}</td>
                <td className="p-4 text-xs text-gray-500">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
