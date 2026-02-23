import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Settings from "@/models/Settings";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { encryptPassword } from "@/lib/encryption";
import uploadToCloudinary from "@/lib/cloudinary";

const MASKED = "********";

export async function GET() {
  try {
    await connectDB();
    const settings = await Settings.findOne();

    if (settings) {
      // Mask secrets before sending to frontend (exact ref repo pattern)
      const masked = settings.toObject();
      if (masked.payment?.razorpayKeySecret) {
        masked.payment.razorpayKeySecret = MASKED;
      }
      if (masked.smtp?.password) {
        masked.smtp.password = MASKED;
      }
      return NextResponse.json(masked);
    }

    return NextResponse.json({});
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

    const contentType = req.headers.get("content-type");
    let data;

    if (contentType?.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;
        const result = await uploadToCloudinary(
          base64Image,
          "sainandhini/brand",
        );
        return NextResponse.json(result);
      }
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    data = await req.json();
    await connectDB();

    // Handle Razorpay secret encryption (exact ref repo pattern)
    if (data.payment?.razorpayKeySecret) {
      if (data.payment.razorpayKeySecret === MASKED) {
        // User didn't change it — keep existing encrypted value
        const existing = await Settings.findOne();
        if (existing?.payment?.razorpayKeySecret) {
          data.payment.razorpayKeySecret = existing.payment.razorpayKeySecret;
        }
      } else {
        // New value — encrypt before saving
        data.payment.razorpayKeySecret = encryptPassword(
          data.payment.razorpayKeySecret,
        );
      }
    }

    // Handle SMTP password encryption (exact ref repo pattern)
    if (data.smtp?.password) {
      if (data.smtp.password === MASKED) {
        // User didn't change it — keep existing encrypted value
        const existing = await Settings.findOne();
        if (existing?.smtp?.password) {
          data.smtp.password = existing.smtp.password;
        }
      } else {
        // New value — encrypt before saving
        data.smtp.password = encryptPassword(data.smtp.password);
      }
    }

    const settings = await Settings.findOneAndUpdate({}, data, {
      new: true,
      upsert: true,
    });

    // Mask secrets in the response
    const response = settings.toObject();
    if (response.payment?.razorpayKeySecret) {
      response.payment.razorpayKeySecret = MASKED;
    }
    if (response.smtp?.password) {
      response.smtp.password = MASKED;
    }

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
