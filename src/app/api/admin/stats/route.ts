import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import Settings from "@/models/Settings";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. Top Summary metrics (Splitting by Source)
    const revenueMetrics = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $facet: {
          today: [
            { $match: { createdAt: { $gte: today } } },
            {
              $group: {
                _id: null,
                total: { $sum: "$totalPrice" },
              },
            },
          ],
          month: [
            { $match: { createdAt: { $gte: startOfMonth } } },
            {
              $group: {
                _id: null,
                total: { $sum: "$totalPrice" },
              },
            },
          ],
          total: [
            {
              $group: {
                _id: null,
                total: { $sum: "$totalPrice" },
              },
            },
          ],
        },
      },
    ]);

    const statsRev = revenueMetrics[0];

    const ordersCount = await Order.countDocuments();
    const pendingOrdersCount = await Order.countDocuments({
      isDelivered: false,
    });
    const productsCount = await Product.countDocuments();
    const customersCount = await User.countDocuments({ role: "customer" });

    // 1.5 Get Threshold from settings
    const settings = await Settings.findOne();
    const threshold = settings?.lowStockThreshold || 10;

    // Stock Alerts
    const lowStockProducts = await Product.find({
      stock: { $lte: threshold, $gt: 0 },
    })
      .select("name stock uom image")
      .limit(5);
    const outOfStockProducts = await Product.find({ stock: 0 })
      .select("name stock uom image")
      .limit(5);

    // 2. Sales Overview (Last 7 Days) with IST Timezone Split
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const salesTrend = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "+05:30",
            },
          },
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing days for the chart
    const chartData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);

      // Format to YYYY-MM-DD in IST
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const found = salesTrend.find((item) => item._id === dateStr);
      chartData.push({
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        amount: found ? found.total : 0,
        orders: found ? found.count : 0,
      });
    }

    // 3. Recent Orders
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email");

    // 4. Top Selling Products
    const topProducts = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          name: { $first: "$orderItems.name" },
          totalSold: { $sum: "$orderItems.qty" },
          revenue: {
            $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] },
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    return NextResponse.json({
      stats: {
        revenue: {
          total: statsRev.total[0]?.total || 0,
          today: statsRev.today[0]?.total || 0,
          month: statsRev.month[0]?.total || 0,
        },
        orders: {
          total: ordersCount,
          pending: pendingOrdersCount,
        },
        products: {
          total: productsCount,
          lowStock: lowStockProducts.length,
          outOfStock: outOfStockProducts.length,
        },
        customers: customersCount,
      },
      stockAlerts: {
        low: lowStockProducts,
        out: outOfStockProducts,
      },
      salesTrend: chartData,
      recentOrders,
      topProducts,
    });
  } catch (error: any) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
