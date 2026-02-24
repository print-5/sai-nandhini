import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

/**
 * GET /api/coupons/active
 * Fetch all active coupons that are valid for display in checkout
 */
export async function GET() {
  try {
    await connectDB();
    const now = new Date();

    const activeCoupons = await Coupon.find({
      isActive: true,
      displayInCheckout: true,
      $or: [{ expiryDate: { $exists: false } }, { expiryDate: { $gt: now } }],
    })
      .select("code type value description minOrderAmount maxDiscountAmount")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: activeCoupons });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
