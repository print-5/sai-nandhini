import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { generateInvoiceHTML } from "@/lib/invoice-generator";
import { generatePDFFromHTML } from "@/lib/pdf-generator";
import { sendOrderConfirmationEmail } from "@/lib/email-service";
import Product from "@/models/Product";
import Settings from "@/models/Settings";
import Coupon from "@/models/Coupon";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    } = await req.json();

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ error: "No order items" }, { status: 400 });
    }

    await connectDB();
    const settings = await Settings.findOne();
    const manageInventory = settings?.manageInventory ?? true;

    // Check and reduce stock if inventory management is enabled
    if (manageInventory) {
      const productsToUpdate = [];

      // 1. Validation Loop
      for (const item of orderItems) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return NextResponse.json(
            { error: `Product ${item.name} not found` },
            { status: 404 },
          );
        }

        if (item.uom && product.variants && product.variants.length > 0) {
          const variantIndex = product.variants.findIndex(
            (v: any) => v.uom === item.uom,
          );
          if (variantIndex !== -1) {
            if (product.variants[variantIndex].stock < item.qty) {
              return NextResponse.json(
                {
                  error: `Insufficient stock for ${product.name} (${item.uom})`,
                },
                { status: 400 },
              );
            }
            product.variants[variantIndex].stock -= item.qty;
          } else {
            // If UOM specified but not found in variants, fall back to base stock if it exists
            if (product.stock < item.qty) {
              return NextResponse.json(
                { error: `Insufficient stock for ${product.name}` },
                { status: 400 },
              );
            }
            product.stock -= item.qty;
          }
        } else {
          if (product.stock < item.qty) {
            return NextResponse.json(
              { error: `Insufficient stock for ${product.name}` },
              { status: 400 },
            );
          }
          product.stock -= item.qty;
        }
        productsToUpdate.push(product);
      }

      // 2. Saving Loop (Only run if all items validated)
      for (const product of productsToUpdate) {
        await product.save();
      }
    }

    // Fix for "admin-fallback" or missing user ID
    let userId = session.user.id;

    // Allow admins to create orders for other customers
    if (customerId && (session.user as any).role === "admin") {
      userId = customerId;
    }

    // If still fallback or invalid (only for admin context logic if needed), try to find a root admin or use a specific system user
    if (userId === "admin-fallback" && (session.user as any).role === "admin") {
      const adminUser = await User.findOne({ role: "admin" });
      if (adminUser) userId = adminUser._id.toString();
      else
        return NextResponse.json(
          { error: "No valid admin user found in database to associate order" },
          { status: 400 },
        );
    }

    const order = new Order({
      orderItems: orderItems.map((x: any) => ({
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

    // If coupon was used, increment usage count
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } },
      );
    }

    // If it's Cash on Delivery, send the email immediately
    if (paymentMethod === "Cash on Delivery") {
      (async () => {
        try {
          const populatedOrder = await Order.findById(
            createdOrder._id,
          ).populate("user");
          const invoiceHTML = await generateInvoiceHTML(populatedOrder);
          const pdfBuffer = await generatePDFFromHTML(invoiceHTML);
          await sendOrderConfirmationEmail(populatedOrder, pdfBuffer);
        } catch (err) {
          console.error("Failed to send COD order confirmation email:", err);
        }
      })();
    }

    return NextResponse.json(createdOrder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const orders = await Order.find({ user: session.user.id })
      .populate({
        path: "orderItems.product",
        select: "slug name",
      })
      .sort({
        createdAt: -1,
      });
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
