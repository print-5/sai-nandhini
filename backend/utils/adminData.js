import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Coupon from "../models/Coupon.js";
import Settings from "../models/Settings.js";
import ShippingRate from "../models/ShippingRate.js";

const MASKED = "********";

export async function getCategoriesData() {
    const categories = await Category.find({}).sort({ order: 1 });
    return JSON.parse(JSON.stringify(categories));
}

export async function getCouponsData() {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(coupons));
}

export async function getProductsData() {
    const products = await Product.find({}).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(products));
}

export async function getSettingsData() {
    const settings = await Settings.findOne();
    if (!settings) return {};

    const masked = settings.toObject();

    if (masked.taxRate !== undefined && (!masked.taxRates || masked.taxRates.length === 0)) {
        masked.taxRates = [{ name: "GST", rate: masked.taxRate, isDefault: true }];
        await Settings.findOneAndUpdate({}, { taxRates: masked.taxRates, $unset: { taxRate: "" } });
    }

    if (masked.payment?.razorpayKeySecret) masked.payment.razorpayKeySecret = MASKED;
    if (masked.payment?.razorpayWebhookSecret) masked.payment.razorpayWebhookSecret = MASKED;
    if (masked.smtp?.password) masked.smtp.password = MASKED;
    if (masked.googleMyBusiness?.apiKey) masked.googleMyBusiness.apiKey = MASKED;

    return JSON.parse(JSON.stringify(masked));
}

export async function getOrdersData() {
    const orders = await Order.find({}).sort({ createdAt: -1 }).populate("user", "name email");
    return JSON.parse(JSON.stringify(orders));
}

export async function getShippingRatesData() {
    const rates = await ShippingRate.find({}).sort({ minAmount: 1 });
    return JSON.parse(JSON.stringify(rates));
}


export async function getAnalyticsData() {
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

    return { salesByCategory, topProducts, paymentMethods };
}

export async function getCustomersWithStats() {
    // Use aggregation pipeline to avoid N+1 queries
    const customersWithStats = await User.aggregate([
        // Match customers and users only
        { $match: { role: { $in: ["customer", "user"] } } },
        
        // Lookup orders for each customer
        {
            $lookup: {
                from: "orders",
                localField: "_id",
                foreignField: "user",
                as: "orders"
            }
        },
        
        // Calculate stats
        {
            $addFields: {
                orderCount: { $size: "$orders" },
                totalSpent: {
                    $reduce: {
                        input: "$orders",
                        initialValue: 0,
                        in: {
                            $add: [
                                "$$value",
                                { $cond: [{ $eq: ["$$this.isPaid", true] }, "$$this.totalPrice", 0] }
                            ]
                        }
                    }
                }
            }
        },
        
        // Remove orders array and password field
        {
            $project: {
                password: 0,
                orders: 0
            }
        },
        
        // Sort by creation date
        { $sort: { createdAt: -1 } }
    ]);

    return customersWithStats;
}

export async function getCustomerByPhone(phone) {
    const customer = await User.findOne({
        phone,
        role: { $in: ["customer", "user"] },
    }).select("-password");
    return customer;
}

export async function getDashboardStats(range = "week") {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Determine current and comparison period start dates
    let days = 7;
    let periodTitle = "Week";
    if (range === "today") {
        days = 1;
        periodTitle = "Today";
    } else if (range === "month") {
        days = 30;
        periodTitle = "Month";
    }

    const currentPeriodStart = new Date(today);
    currentPeriodStart.setDate(today.getDate() - (days - 1));

    const prevPeriodEnd = new Date(currentPeriodStart);
    prevPeriodEnd.setMilliseconds(-1);

    const prevPeriodStart = new Date(currentPeriodStart);
    prevPeriodStart.setDate(currentPeriodStart.getDate() - days);

    // Execute all queries in parallel for better performance
    const [
        settings,
        productsCount,
        customersCount,
        metrics,
        salesTrend,
        lowStockProducts,
        outOfStockProducts,
        recentOrders,
        topProductsList,
    ] = await Promise.all([
        // 1. Settings for threshold
        Settings.findOne().select("lowStockThreshold").lean(),
        
        // 2. Basic counts
        Product.countDocuments(),
        User.countDocuments({ role: { $in: ["customer", "user"] } }),
        
        // 3. Main metrics aggregation
        Order.aggregate([
            {
                $facet: {
                    // Current Period Stats
                    current: [
                        { $match: { createdAt: { $gte: currentPeriodStart } } },
                        {
                            $group: {
                                _id: null,
                                revenue: { $sum: { $cond: ["$isPaid", "$totalPrice", 0] } },
                                orders: { $sum: 1 },
                                pendingOrders: {
                                    $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
                                },
                                activeOrders: {
                                    $sum: {
                                        $cond: [
                                            { $in: ["$status", ["Pending", "Processing", "Shipping"]] },
                                            1,
                                            0,
                                        ],
                                    },
                                },
                            },
                        },
                    ],
                    // Previous Period Stats
                    previous: [
                        {
                            $match: {
                                createdAt: { $gte: prevPeriodStart, $lt: currentPeriodStart },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                revenue: { $sum: { $cond: ["$isPaid", "$totalPrice", 0] } },
                                orders: { $sum: 1 },
                            },
                        },
                    ],
                    // All Time Revenue
                    allTime: [
                        {
                            $group: {
                                _id: null,
                                totalRevenue: { $sum: { $cond: ["$isPaid", "$totalPrice", 0] } },
                                totalOrders: { $sum: 1 },
                            },
                        },
                    ],
                    // Status Distribution
                    statusDistribution: [
                        { $match: { createdAt: { $gte: currentPeriodStart } } },
                        {
                            $group: {
                                _id: "$status",
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    // Revenue by Category (Top 5)
                    revenueByCategory: [
                        { $match: { isPaid: true, createdAt: { $gte: currentPeriodStart } } },
                        { $unwind: "$orderItems" },
                        {
                            $lookup: {
                                from: "products",
                                localField: "orderItems.product",
                                foreignField: "_id",
                                as: "product",
                            },
                        },
                        { $unwind: "$product" },
                        {
                            $group: {
                                _id: "$product.category",
                                value: {
                                    $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] },
                                },
                            },
                        },
                        { $sort: { value: -1 } },
                        { $limit: 5 },
                    ],
                },
            },
        ]),
        
        // 4. Sales Trend
        Order.aggregate([
            { $match: { isPaid: true, createdAt: { $gte: currentPeriodStart } } },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: range === "today" ? "%H:00" : "%Y-%m-%d",
                            date: "$createdAt",
                            timezone: "+05:30",
                        },
                    },
                    total: { $sum: "$totalPrice" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]),
        
        // 5. Stock alerts - parallel execution
        Product.find({
            stock: { $lte: (settings?.lowStockThreshold || 10), $gt: 0 },
        })
            .select("name stock uom images")
            .limit(5)
            .lean(),
            
        // 6. Out of stock products
        Product.find({ stock: 0 })
            .select("name stock uom images")
            .limit(5)
            .lean(),
            
        // 7. Recent Orders
        Order.find({})
            .sort({ createdAt: -1 })
            .limit(8)
            .populate("user", "name email")
            .lean(),
            
        // 8. Top Selling Products
        Order.aggregate([
            { $match: { isPaid: true, createdAt: { $gte: currentPeriodStart } } },
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
        ]),
    ]);

    const threshold = settings?.lowStockThreshold || 10;
    const m = metrics[0];
    const curStats = m.current[0] || {
        revenue: 0,
        orders: 0,
        pendingOrders: 0,
        activeOrders: 0,
    };
    const prevStats = m.previous[0] || { revenue: 0, orders: 0 };
    const allTimeStats = m.allTime[0] || { totalRevenue: 0, totalOrders: 0 };

    // Calculate Growth Percentages
    const calculateGrowth = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const revenueGrowth = calculateGrowth(curStats.revenue, prevStats.revenue);
    const ordersGrowth = calculateGrowth(curStats.orders, prevStats.orders);

    // Fill Trend Data
    const chartData = [];
    if (range === "today") {
        for (let i = 0; i <= now.getHours(); i++) {
            const hour = String(i).padStart(2, "0") + ":00";
            const found = salesTrend.find((item) => item._id === hour);
            chartData.push({
                date: hour,
                amount: found ? found.total : 0,
                orders: found ? found.count : 0,
            });
        }
    } else {
        for (let i = 0; i < days; i++) {
            const date = new Date(currentPeriodStart);
            date.setDate(currentPeriodStart.getDate() + i);

            // Calculate IST date string YYYY-MM-DD
            const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
            const dateStr = istDate.toISOString().split("T")[0];

            const found = salesTrend.find((item) => item._id === dateStr);
            chartData.push({
                date:
                    days > 7
                        ? `${date.getDate()} ${date.toLocaleString("en-US", { month: "short" })}`
                        : date.toLocaleDateString("en-US", { weekday: "short" }),
                amount: found ? found.total : 0,
                orders: found ? found.count : 0,
                fullDate: dateStr,
            });
        }
    }

    // Execute final stock counts in parallel
    const [lowStockCount, outOfStockCount] = await Promise.all([
        Product.countDocuments({ stock: { $lte: threshold, $gt: 0 } }),
        Product.countDocuments({ stock: 0 }),
    ]);

    return {
        range,
        stats: {
            revenue: {
                current: curStats.revenue,
                previous: prevStats.revenue,
                total: allTimeStats.totalRevenue,
                growth: revenueGrowth,
            },
            orders: {
                current: curStats.orders,
                previous: prevStats.orders,
                total: allTimeStats.totalOrders,
                pending: curStats.pendingOrders,
                active: curStats.activeOrders,
                growth: ordersGrowth,
            },
            products: {
                total: productsCount,
                lowStock: lowStockCount,
                outOfStock: outOfStockCount,
            },
            customers: {
                total: customersCount,
            },
            statusDistribution: m.statusDistribution.reduce(
                (acc, cur) => {
                    acc[cur._id || "Unknown"] = cur.count;
                    return acc;
                },
                {},
            ),
            revenueByCategory: m.revenueByCategory,
        },
        stockAlerts: {
            low: lowStockProducts,
            out: outOfStockProducts,
        },
        salesTrend: chartData,
        recentOrders,
        topProducts: topProductsList,
    };
}
