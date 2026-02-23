import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true }).sort({
      order: 1,
    });
    return NextResponse.json(categories);
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

    await connectDB();

    let name, slug, description, imageUrl;
    const contentType = req.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const body = await req.json();
      name = body.name;
      slug = body.slug;
      description = body.description;
      imageUrl = body.image;
    } else {
      const formData = await req.formData();
      const file = formData.get("file") as File;

      // Standalone upload for ImageUpload component
      if (file && !formData.get("name")) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;
        const result = await uploadToCloudinary(
          base64Image,
          "sainandhini/categories",
        );
        return NextResponse.json(result);
      }

      name = formData.get("name") as string;
      slug = formData.get("slug") as string;
      description = formData.get("description") as string;
      const imageFile = formData.get("image") as File;

      if (imageFile && imageFile instanceof File) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const base64Image = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
        const { secure_url } = await uploadToCloudinary(
          base64Image,
          "sainandhini/categories",
        );
        imageUrl = secure_url;
      }
    }

    const existing = await Category.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 400 },
      );
    }

    const category = await Category.create({
      name,
      slug,
      image: imageUrl,
      description,
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
