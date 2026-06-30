import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/auth";
import { updateOrderStatus } from "@/lib/orders/order-service";
import type { OrderStatus } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const { status, note } = await request.json();

    await updateOrderStatus(id, status as OrderStatus, note);
    await logAdminAction(session.adminId, "UPDATE_STATUS", "Order", id, status);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    return NextResponse.json({ error: "Güncellenemedi" }, { status: 500 });
  }
}
