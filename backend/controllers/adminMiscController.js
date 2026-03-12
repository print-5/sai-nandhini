import Page from "../models/Page.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import Enquiry from "../models/Enquiry.js";
import Coupon from "../models/Coupon.js";
import UOM from "../models/UOM.js";
import StockTransaction from "../models/StockTransaction.js";
import ShippingRate from "../models/ShippingRate.js";

// Admin Page Handlers
export const getAdminPage = async (req, res) => {
    try {
        const slug = req.query.slug;
        if (!slug) return res.status(400).json({ error: "Slug is required" });

        const page = await Page.findOne({ slug });
        if (!page) return res.json({ title: "", content: "" });

        res.json(page);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateAdminPage = async (req, res) => {
    try {
        const { slug, title, content } = req.body;
        if (!slug || !title || !content) return res.status(400).json({ error: "Missing required fields" });

        let page = await Page.findOne({ slug });
        if (page) {
            page.title = title;
            page.content = content;
            page.lastUpdated = Date.now();
            await page.save();
            return res.json({ message: "Page updated successfully", page });
        } else {
            page = await Page.create({ slug, title, content });
            return res.status(201).json({ message: "Page created successfully", page });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin Reports Handlers
export const getOrdersReport = async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate("user", "name email")
            .populate("orderItems.product", "name"); // NOTE: Previous Next.js code had populate("items.product", "name") but Schema is orderItems

        const header = [
            "Order ID",
            "Date",
            "Customer Name",
            "Customer Email",
            "Status",
            "Total Amount",
            "Items",
        ];

        const rows = orders.map((order) => [
            order._id,
            new Date(order.createdAt).toISOString(),
            order.user?.name || "Guest",
            order.user?.email || "N/A",
            order.status,
            order.totalPrice, // NOTE: Next.js had order.totalAmount but Schema is totalPrice
            order.orderItems?.map((i) => `${i.product?.name || i.name} (x${i.qty})`).join("; ") || "",
        ]);

        const csvContent = [header, ...rows].map((e) => e.join(",")).join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="orders_report_${new Date().toISOString().split("T")[0]}.csv"`);
        res.status(200).send(csvContent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const resetDemoData = async (req, res) => {
    try {
        await Promise.all([
            Product.deleteMany({}),
            Category.deleteMany({}),
            SubCategory.deleteMany({}),
            Order.deleteMany({}),
            Enquiry.deleteMany({}),
            Coupon.deleteMany({}),
            UOM.deleteMany({}),
            StockTransaction.deleteMany({}),
            ShippingRate.deleteMany({}),
        ]);
        res.json({ message: "All demo data erased successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message || "Failed to erase data" });
    }
};
