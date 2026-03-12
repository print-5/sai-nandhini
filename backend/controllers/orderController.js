import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Settings from "../models/Settings.js";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";

export const createOrder = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            discountPrice,
            totalPrice,
            couponCode,
            discount,
            customerId,
        } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ error: "No order items" });
        }

        const settings = await Settings.findOne();
        const manageInventory = settings?.manageInventory ?? true;

        // Check and reduce stock if inventory management is enabled
        if (manageInventory) {
            // Get all product IDs to fetch in one query
            const productIds = orderItems.map(item => item.productId);
            const products = await Product.find({ _id: { $in: productIds } });
            
            // Create a map for quick lookup
            const productMap = new Map();
            products.forEach(product => {
                productMap.set(product._id.toString(), product);
            });

            const productsToUpdate = [];

            // 1. Validation Loop
            for (const item of orderItems) {
                const product = productMap.get(item.productId);
                if (!product) {
                    return res.status(404).json({ error: `Product ${item.name} not found` });
                }

                if (item.uom && product.variants && product.variants.length > 0) {
                    const variantIndex = product.variants.findIndex((v) => v.uom === item.uom);
                    if (variantIndex !== -1) {
                        if (product.variants[variantIndex].stock < item.qty) {
                            return res.status(400).json({ error: `Insufficient stock for ${product.name} (${item.uom})` });
                        }
                        product.variants[variantIndex].stock -= item.qty;
                    } else {
                        if (product.stock < item.qty) {
                            return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
                        }
                        product.stock -= item.qty;
                    }
                } else {
                    if (product.stock < item.qty) {
                        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
                    }
                    product.stock -= item.qty;
                }
                productsToUpdate.push(product);
            }

            // 2. Bulk save all products in parallel
            await Promise.all(productsToUpdate.map(product => product.save()));
        }

        let userId = req.user ? req.user.id : null;

        if (customerId && req.user && req.user.role === "admin") {
            userId = customerId;
        }

        const order = new Order({
            orderItems: orderItems.map((x) => ({
                ...x,
                product: x.productId,
                _id: undefined,
            })),
            user: userId,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            discountPrice,
            couponCode: couponCode || null,
            discount: discount || 0,
            totalPrice,
        });

        const createdOrder = await order.save();

        // Handle coupon limits
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

            if (coupon) {
                coupon.usedCount = (coupon.usedCount || 0) + 1;
                if (userId) {
                    const userUsageIndex = coupon.usedByUsers?.findIndex(
                        (u) => u.userId.toString() === userId.toString()
                    );

                    if (userUsageIndex !== undefined && userUsageIndex >= 0) {
                        coupon.usedByUsers[userUsageIndex].count += 1;
                        coupon.usedByUsers[userUsageIndex].lastUsedAt = new Date();
                    } else {
                        if (!coupon.usedByUsers) coupon.usedByUsers = [];
                        coupon.usedByUsers.push({
                            userId: userId,
                            count: 1,
                            lastUsedAt: new Date(),
                        });
                    }
                }
                await coupon.save();
            }
        }

        // Ignore email for now unless they configure nodemailer in the backend 
        // Later we can implement invoice generator and email service logic in the backend.

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const orders = await Order.find({ user: req.user.id })
            .populate({
                path: "orderItems.product",
                select: "slug name",
            })
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
