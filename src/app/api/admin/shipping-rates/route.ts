import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ShippingRate from "@/models/ShippingRate";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    await connectDB();
    const rates = await ShippingRate.find().sort({ minAmount: 1 });
    return NextResponse.json(rates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    // Ensure amounts are valid numbers
    if (body.minAmount >= body.maxAmount) {
      return NextResponse.json(
        { error: "Min amount must be less than max amount" },
        { status: 400 },
      );
    }

    const rate = await ShippingRate.create(body);
    return NextResponse.json(rate, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
