import Coupon from "../models/Coupon.js";
import { getCouponsData } from "../utils/adminData.js";

export const getAdminCoupons = async (req, res) => {
    try {
        const coupons = await getCouponsData();
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createAdminCoupon = async (req, res) => {
    try {
        const body = req.body;

        if (Array.isArray(body)) {
            const createdCoupons = [];
            const errors = [];
            const existingCodes = new Set(await Coupon.find().distinct("code"));

            for (const couponData of body) {
                try {
                    if (existingCodes.has(couponData.code.toUpperCase())) {
                        errors.push(`Coupon code ${couponData.code} already exists`);
                        continue;
                    }
                    const coupon = await Coupon.create({
                        ...couponData,
                        code: couponData.code.toUpperCase(),
                        createdBy: req.user._id,
                    });
                    createdCoupons.push(coupon);
                    existingCodes.add(coupon.code);
                } catch (err) {
                    errors.push(`Failed to create ${couponData.code}: ${err.message}`);
                }
            }

            return res.status(201).json({
                success: true,
                count: createdCoupons.length,
                data: createdCoupons,
                errors: errors.length > 0 ? errors : undefined,
            });
        }

        const existing = await Coupon.findOne({ code: body.code.toUpperCase() });
        if (existing) return res.status(400).json({ error: "Coupon code already exists" });

        const coupon = await Coupon.create({
            ...body,
            code: body.code.toUpperCase(),
            createdBy: req.user._id,
        });

        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
