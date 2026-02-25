import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Settings from "@/models/Settings";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { encryptPassword } from "@/lib/encryption";
import { uploadToCloudinary } from "@/lib/cloudinary";

const MASKED = "********";

export async function GET() {
  try {
    await connectDB();
    const settings = await Settings.findOne();

    if (settings) {
      const masked = settings.toObject();
      
      // Migration: Convert old taxRate to taxRates array
      if (masked.taxRate !== undefined && (!masked.taxRates || masked.taxRates.length === 0)) {
        masked.taxRates = [
          {
            name: "GST",
            rate: masked.taxRate,
            isDefault: true,
          },
        ];
        // Update in database
        await Settings.findOneAndUpdate(
          {},
          { 
            taxRates: masked.taxRates,
            $unset: { taxRate: "" }
          }
        );
      }
      
      if (masked.payment?.razorpayKeySecret)
        masked.payment.razorpayKeySecret = MASKED;
      if (masked.smtp?.password) masked.smtp.password = MASKED;
      return NextResponse.json(masked);
    }

    return NextResponse.json({});
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type");
    let data;

    if (contentType?.includes("multipart/form-data")) {
      const formData = await req.formData();
      const rawData = formData.get("data") as string;
      data = JSON.parse(rawData);

      const logoFile = formData.get("logo") as File;
      const faviconFile = formData.get("favicon") as File;

      if (logoFile && logoFile instanceof File) {
        const buffer = Buffer.from(await logoFile.arrayBuffer());
        const base64Image = `data:${logoFile.type};base64,${buffer.toString("base64")}`;
        const result = await uploadToCloudinary(
          base64Image,
          "sainandhini/brand",
        );
        data.logo = result.secure_url;
      }

      if (faviconFile && faviconFile instanceof File) {
        const buffer = Buffer.from(await faviconFile.arrayBuffer());
        const base64Image = `data:${faviconFile.type};base64,${buffer.toString("base64")}`;
        const result = await uploadToCloudinary(
          base64Image,
          "sainandhini/brand",
        );
        data.favicon = result.secure_url;
      }
    } else {
      data = await req.json();
    }

    await connectDB();

    // Handle Sensitive fields
    const existing = await Settings.findOne();

    if (data.payment?.razorpayKeySecret) {
      if (data.payment.razorpayKeySecret === MASKED) {
        data.payment.razorpayKeySecret = existing?.payment?.razorpayKeySecret;
      } else {
        data.payment.razorpayKeySecret = encryptPassword(
          data.payment.razorpayKeySecret,
        );
      }
    }

    if (data.smtp?.password) {
      if (data.smtp.password === MASKED) {
        data.smtp.password = existing?.smtp?.password;
      } else {
        data.smtp.password = encryptPassword(data.smtp.password);
      }
    }

    const settings = await Settings.findOneAndUpdate({}, data, {
      new: true,
      upsert: true,
    });

    const response = settings.toObject();
    if (response.payment?.razorpayKeySecret)
      response.payment.razorpayKeySecret = MASKED;
    if (response.smtp?.password) response.smtp.password = MASKED;

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
