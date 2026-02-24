import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

/**
 * POST /api/coupons/validate
 * Validate a coupon code and return discount details
 */
export async function POST(req: Request) {
  try {
    const { code, orderAmount } = await req.json();

    if (!code || !orderAmount) {
      return NextResponse.json(
        { error: "Coupon code and order amount required" },
        { status: 400 },
      );
    }

    await connectDB();
    const now = new Date();

    // Find coupon by code
    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 404 },
      );
    }

    // Check if coupon is valid (expiryDate)
    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return NextResponse.json(
        { error: "Coupon has expired" },
        { status: 400 },
      );
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: "Coupon usage limit reached" },
        { status: 400 },
      );
    }

    // Check minimum order amount
    if (orderAmount < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`,
        },
        { status: 400 },
      );
    }

    // Calculate discount
    let discount = 0;
    let isFreeDelivery = false;

    if (coupon.type === "free-delivery") {
      isFreeDelivery = true;
      discount = 0;
    } else if (coupon.type === "percentage") {
      discount = (orderAmount * coupon.value) / 100;
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else if (coupon.type === "fixed") {
      discount = coupon.value;
    }

    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount: discount,
        isFreeDelivery: isFreeDelivery,
        description: coupon.description,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
