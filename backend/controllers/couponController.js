import Coupon from "../models/Coupon.js";

// @desc    Get all active coupons
// @route   GET /api/coupons/active
// @access  Public
export const getActiveCoupons = async (req, res) => {
    try {
        const now = new Date();

        const activeCoupons = await Coupon.find({
            isActive: true,
            displayInCheckout: true,
            $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }],
        })
            .select("code discountType discountValue description minOrderValue maxDiscountAmount")
            .sort({ createdAt: -1 });

        res.json({ success: true, data: activeCoupons });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Public
export const validateCoupon = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;

        if (!code || orderAmount === undefined) {
            return res.status(400).json({ error: "Coupon code and order amount required" });
        }

        const userId = req.user ? req.user._id.toString() : null;

        const coupon = await Coupon.findOne({
            code: code.toUpperCase().trim(),
            isActive: true,
        });

        if (!coupon) {
            return res.status(404).json({ error: "Invalid coupon code" });
        }

        if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
            return res.status(400).json({ error: "Coupon has expired" });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ error: "Coupon usage limit reached" });
        }

        if (userId && coupon.perUserLimit) {
            const userUsage = coupon.usedByUsers?.find(
                (u) => u.userId.toString() === userId
            );
            const userCount = userUsage?.count || 0;

            if (userCount >= coupon.perUserLimit) {
                return res.status(400).json({
                    error: `You have already used this coupon ${coupon.perUserLimit} time${coupon.perUserLimit > 1 ? "s" : ""}`,
                });
            }
        }

        if (orderAmount < coupon.minOrderValue) {
            return res.status(400).json({
                error: `Minimum order amount of ₹${coupon.minOrderValue} required for this coupon`,
            });
        }

        let discount = 0;
        let isFreeDelivery = false;

        if (coupon.discountType === "free-delivery") {
            isFreeDelivery = true;
            discount = 0;
        } else if (coupon.discountType === "percentage") {
            discount = (orderAmount * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                discount = coupon.maxDiscountAmount;
            }
        } else if (coupon.discountType === "fixed") {
            discount = coupon.discountValue;
        }

        res.json({
            success: true,
            data: {
                code: coupon.code,
                type: coupon.discountType,
                value: coupon.discountValue,
                discount: discount,
                isFreeDelivery: isFreeDelivery,
                description: coupon.description,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
