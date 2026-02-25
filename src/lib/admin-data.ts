import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Coupon from "@/models/Coupon";
import Settings from "@/models/Settings";
import ShippingRate from "@/models/ShippingRate";

export async function getAnalyticsData() {
  await connectDB();

  // 1. Sales by Category
  const salesByCategory = await Order.aggregate([
    { $match: { isPaid: true } },
    { $unwind: "$orderItems" },
    {
      $lookup: {
        from: "products",
        localField: "orderItems.product",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    {
      $group: {
        _id: "$productDetails.category",
        totalAmount: {
          $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] },
        },
        count: { $sum: "$orderItems.qty" },
      },
    },
    { $sort: { totalAmount: -1 } },
  ]);

  // 2. Top Selling Products
  const topProducts = await Order.aggregate([
    { $match: { isPaid: true } },
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.product",
        name: { $first: "$orderItems.name" },
        totalSales: {
          $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] },
        },
        totalQty: { $sum: "$orderItems.qty" },
      },
    },
    { $sort: { totalSales: -1 } },
    { $limit: 5 },
  ]);

  // 3. Payment Method Distribution
  const paymentMethods = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: "$paymentMethod",
        count: { $sum: 1 },
        totalAmount: { $sum: "$totalPrice" },
      },
    },
  ]);

  return {
    salesByCategory,
    topProducts,
    paymentMethods,
  };
}

export async function getCustomersWithStats() {
  await connectDB();

  // Get all customers (and standard users)
  const customers = await User.find({ role: { $in: ["customer", "user"] } })
    .select("-password")
    .sort({ createdAt: -1 });

  // Get order stats for each customer
  const customersWithStats = await Promise.all(
    customers.map(async (customer) => {
      const orders = await Order.find({ user: customer._id });
      const totalSpent = orders.reduce(
        (sum, order) => sum + (order.isPaid ? order.totalPrice : 0),
        0,
      );
      return {
        ...customer.toObject(),
        _id: customer._id.toString(), // Convert ObjectId to string for serialization
        orderCount: orders.length,
        totalSpent,
      };
    }),
  );

  return JSON.parse(JSON.stringify(customersWithStats));
}

export async function getCustomerByPhone(phone: string) {
  await connectDB();
  const customer = await User.findOne({
    phone,
    role: { $in: ["customer", "user"] },
  }).select("-password");
  return customer ? JSON.parse(JSON.stringify(customer)) : null;
}

export async function getCategoriesData() {
  await connectDB();
  const categories = await Category.find({}).sort({ order: 1 });
  return JSON.parse(JSON.stringify(categories));
}

export async function getCouponsData() {
  await connectDB();
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(coupons));
}

export async function getDashboardStats(range: string = "week") {
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
    .select("name stock uom images")
    .limit(5);
  const outOfStockProducts = await Product.find({ stock: 0 })
    .select("name stock uom images")
    .limit(5);

  // 2. Sales Overview based on range
  let days = 7;
  if (range === "today") days = 1;
  if (range === "month") days = 30;

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (days - 1));

  const salesTrend = await Order.aggregate([
    { $match: { isPaid: true, createdAt: { $gte: startDate } } },
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
  ]);

  // Fill in missing days for the chart
  const chartData = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    // Format to YYYY-MM-DD in IST
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const found = salesTrend.find((item) => item._id === dateStr);
    chartData.push({
      date:
        days === 1
          ? date.toLocaleTimeString("en-US", { hour: "numeric" })
          : days > 7
            ? `${date.getDate()} ${date.toLocaleDateString("en-US", { month: "short" })}`
            : date.toLocaleDateString("en-US", { weekday: "short" }),
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

  return JSON.parse(
    JSON.stringify({
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
    }),
  );
}

export async function getProductsData() {
  await connectDB();
  const products = await Product.find({}).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(products));
}

export async function getSettingsData() {
  await connectDB();
  const settings = await Settings.findOne();
  return JSON.parse(JSON.stringify(settings || {}));
}

export async function getOrdersData() {
  await connectDB();
  const orders = await Order.find({})
    .sort({ createdAt: -1 })
    .populate("user", "name email");
  return JSON.parse(JSON.stringify(orders));
}
export async function getShippingRatesData() {
  await connectDB();
  const rates = await ShippingRate.find({}).sort({ minAmount: 1 });
  return JSON.parse(JSON.stringify(rates));
}
