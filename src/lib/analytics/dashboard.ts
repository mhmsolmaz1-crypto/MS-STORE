import prisma from "../prisma";
import { startOfDay, endOfDay, subDays, format, eachDayOfInterval } from "date-fns";
import { tr } from "date-fns/locale";

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  todayOrders: number;
  todayRevenue: number;
  totalRevenue: number;
  totalCustomers: number;
  unreadMessages: number;
  lowStockProducts: number;
  pendingInvoices: number;
  failedInvoices: number;
}

export interface RevenueDataPoint {
  date: string;
  label: string;
  revenue: number;
  orderCount: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const [
    totalOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    todayOrders,
    todayRevenueAgg,
    totalRevenueAgg,
    totalCustomers,
    unreadMessages,
    lowStockProducts,
    pendingInvoices,
    failedInvoices,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PROCESSING" } }),
    prisma.order.count({ where: { status: "SHIPPED" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.order.count({
      where: { createdAt: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: todayStart, lte: todayEnd },
        paymentStatus: "PAID",
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    }),
    prisma.customer.count(),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.product.count({
      where: { trackInventory: true, stockQuantity: { lte: 5 }, isActive: true },
    }),
    prisma.invoice.count({ where: { status: "PENDING" } }),
    prisma.invoice.count({ where: { status: "FAILED" } }),
  ]);

  return {
    totalOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    todayOrders,
    todayRevenue: todayRevenueAgg._sum.totalAmount ?? 0,
    totalRevenue: totalRevenueAgg._sum.totalAmount ?? 0,
    totalCustomers,
    unreadMessages,
    lowStockProducts,
    pendingInvoices,
    failedInvoices,
  };
}

export async function getRevenueChart(days = 30): Promise<RevenueDataPoint[]> {
  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startOfDay(startDate), lte: endOfDay(endDate) },
      paymentStatus: "PAID",
    },
    select: { createdAt: true, totalAmount: true },
  });

  const dayMap = new Map<string, { revenue: number; orderCount: number }>();

  eachDayOfInterval({ start: startDate, end: endDate }).forEach((day) => {
    const key = format(day, "yyyy-MM-dd");
    dayMap.set(key, { revenue: 0, orderCount: 0 });
  });

  orders.forEach((order) => {
    const key = format(order.createdAt, "yyyy-MM-dd");
    const existing = dayMap.get(key);
    if (existing) {
      existing.revenue += order.totalAmount;
      existing.orderCount += 1;
    }
  });

  return Array.from(dayMap.entries()).map(([date, data]) => ({
    date,
    label: format(new Date(date), "d MMM", { locale: tr }),
    revenue: Math.round(data.revenue * 100) / 100,
    orderCount: data.orderCount,
  }));
}

export async function getTopProducts(limit = 10): Promise<TopProduct[]> {
  const items = await prisma.orderItem.groupBy({
    by: ["productId", "productName"],
    _sum: { quantity: true, lineTotal: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  return items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    totalSold: item._sum.quantity ?? 0,
    totalRevenue: item._sum.lineTotal ?? 0,
  }));
}

export async function getRecentOrders(limit = 10) {
  return prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { firstName: true, lastName: true, email: true } },
      items: { select: { quantity: true } },
    },
  });
}

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export async function getOrders(filters: OrderFilters = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (filters.status) where.status = filters.status;
  if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;

  if (filters.search) {
    where.OR = [
      { orderNumber: { contains: filters.search } },
      { shippingFirstName: { contains: filters.search } },
      { shippingLastName: { contains: filters.search } },
      { shippingPhone: { contains: filters.search } },
      { customer: { email: { contains: filters.search } } },
    ];
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) (where.createdAt as Record<string, Date>).gte = filters.dateFrom;
    if (filters.dateTo) (where.createdAt as Record<string, Date>).lte = filters.dateTo;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        items: true,
        invoice: true,
        payments: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, page, totalPages: Math.ceil(total / limit) };
}
