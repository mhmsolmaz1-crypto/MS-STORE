import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const data = await request.json();

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug || slugify(data.name),
        description: data.description,
        shortDescription: data.shortDescription,
        sku: data.sku,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        costPrice: data.costPrice,
        stockQuantity: data.stockQuantity,
        categoryId: data.categoryId || null,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        images: data.images ?? "[]",
      },
    });

    await logAdminAction(session.adminId, "CREATE", "Product", product.id);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    return NextResponse.json({ error: "Ürün eklenemedi" }, { status: 500 });
  }
}
