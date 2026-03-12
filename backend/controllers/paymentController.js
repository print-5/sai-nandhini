import Razorpay from "razorpay";
import crypto from "crypto";
import Settings from "../models/Settings.js";
import Order from "../models/Order.js";
import { decryptPassword } from "../utils/encryption.js";

// Helper: get decrypted payment config from DB
async function getDecryptedPaymentConfig() {
    const config = await Settings.findOne();
    if (!config?.payment?.razorpayKeyId) return null;

    return {
        keyId: config.payment.razorpayKeyId,
        keySecret: config.payment.razorpayKeySecret
            ? decryptPassword(config.payment.razorpayKeySecret)
            : null,
        webhookSecret: config.payment.razorpayWebhookSecret
            ? decryptPassword(config.payment.razorpayWebhookSecret)
            : null,
    };
}

// @desc    Create Razorpay Order
// @route   POST /api/payments/razorpay
// @access  Public (supports both guest and authenticated users)
export const createPayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ error: "Order ID is required" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Verify order ownership (only if order has a user)
        if (order.user && req.user) {
            // If order has a user and request has a user, verify they match
            if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({ error: "Unauthorized access to order" });
            }
        }
        // Guest orders (order.user is null) are allowed without authentication

        const paymentConfig = await getDecryptedPaymentConfig();
        const key_id = paymentConfig?.keyId || process.env.RAZORPAY_KEY_ID;
        const key_secret = paymentConfig?.keySecret || process.env.RAZORPAY_KEY_SECRET;

        if (!key_id || !key_secret) {
            return res.status(500).json({
                error: "Payment configuration not found. Please configure Razorpay keys in Admin Settings.",
            });
        }

        const razorpay = new Razorpay({ key_id, key_secret });
        const amount = order.totalPrice;
        const currency = "INR";

        const options = {
            amount: Math.round(amount * 100),
            currency,
            receipt: `receipt_${order._id}`,
            notes: { orderId: order._id.toString() },
        };

        try {
            const rzpOrder = await razorpay.orders.create(options);
            res.json({ ...rzpOrder, key: key_id });
        } catch (rzpError) {
            console.error("Razorpay SDK Error:", rzpError);
            res.status(502).json({ error: rzpError.error?.description || "Razorpay SDK Error" });
        }
    } catch (error) {
        console.error("Payment Route Error:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/verify
// @access  Public
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
            return res.status(400).json({ error: "Missing payment verification details" });
        }

        const paymentConfig = await getDecryptedPaymentConfig();
        const key_secret = paymentConfig?.keySecret || process.env.RAZORPAY_KEY_SECRET;

        if (!key_secret) {
            return res.status(500).json({ error: "Payment config missing" });
        }

        const generated_signature = crypto
            .createHmac("sha256", key_secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature === razorpay_signature) {
            const order = await Order.findById(orderId);
            if (!order) return res.status(404).json({ error: "Order not found" });

            order.isPaid = true;
            order.paidAt = new Date();
            order.paymentResult = {
                id: razorpay_payment_id,
                status: "completed",
                email_address: "",
            };
            await order.save();

            // Removed Email sending logic here as requested in previous migrations to decouple backend specifics.
            // This can be re-enabled if nodemailer is configured.

            return res.json({ success: true, message: "Payment verified successfully", orderId: order._id });
        } else {
            return res.status(400).json({ success: false, error: "Invalid payment signature" });
        }
    } catch (error) {
        console.error("Payment Verification Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Razorpay Webhook
// @route   POST /api/payments/webhook
// @access  Public
export const razorpayWebhook = async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];

        if (!signature) {
            return res.status(400).json({ success: false, error: "No signature provided" });
        }

        const webhookSecret = await getDecryptedPaymentConfig().then(c => c?.webhookSecret);
        if (!webhookSecret) {
            return res.status(400).json({ success: false, error: "Webhook secret not configured" });
        }

        const rawBody = req.body; // Needs to be raw string for crypto verification, assume express middleware handles this or raw body parser is used on this route
        const event = JSON.parse(rawBody.toString());

        const shasum = crypto.createHmac("sha256", webhookSecret);
        shasum.update(rawBody);
        const digest = shasum.digest("hex");

        if (digest !== signature) {
            return res.status(400).json({ success: false, error: "Invalid signature" });
        }

        if (event.event === "payment.captured") {
            const internalOrderId = event.payload.payment.entity.notes?.orderId;
            if (internalOrderId) {
                const order = await Order.findById(internalOrderId);
                if (order) {
                    order.isPaid = true;
                    order.paidAt = new Date();
                    order.paymentResult = {
                        id: event.payload.payment.entity.id,
                        status: "completed",
                        email_address: event.payload.payment.entity.email || "",
                    };
                    await order.save();
                }
            }
        }

        if (event.event === "order.paid") {
            const internalOrderId = event.payload.order.entity.notes?.orderId;
            if (internalOrderId) {
                const order = await Order.findById(internalOrderId);
                if (order && !order.isPaid) {
                    order.isPaid = true;
                    order.paidAt = new Date();
                    if (event.payload.payment?.entity) {
                        order.paymentResult = {
                            id: event.payload.payment.entity.id,
                            status: "completed",
                            email_address: "",
                        };
                    }
                    await order.save();
                }
            }
        }

        res.json({ success: true, status: "ok" });
    } catch (error) {
        console.error("Webhook Handler Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};
