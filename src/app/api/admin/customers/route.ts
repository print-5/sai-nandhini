import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (phone) {
      const customer = await User.findOne({
        phone,
        role: { $in: ["customer", "user"] },
      }).select("-password");
      if (!customer) return NextResponse.json(null);
      return NextResponse.json(customer);
    }

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
          orderCount: orders.length,
          totalSpent,
        };
      }),
    );

    return NextResponse.json(customersWithStats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
