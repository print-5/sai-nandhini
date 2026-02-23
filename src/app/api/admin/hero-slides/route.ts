import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import HeroSlide from "@/models/HeroSlide";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { uploadToCloudinary, getUrlFromPublicId } from "@/lib/cloudinary";

/* ────────── Seed defaults if collection is empty ────────── */
let seedingPromise: Promise<void> | null = null;

const seedDefaults = async () => {
  // Prevent concurrent seeding (race condition fix)
  if (seedingPromise) return seedingPromise;

  const count = await HeroSlide.countDocuments();
  if (count > 0) {
    // Deduplicate if needed (one-time cleanup)
    const slides = await HeroSlide.find().sort({ createdAt: 1 });
    const seen = new Set<string>();
    const toDelete: string[] = [];
    for (const s of slides) {
      const key = `${s.title}-${s.titleAccent}`;
      if (seen.has(key)) toDelete.push(s._id);
      else seen.add(key);
    }
    if (toDelete.length > 0) {
      await HeroSlide.deleteMany({ _id: { $in: toDelete } });
      console.log(`🧹 Removed ${toDelete.length} duplicate hero slides`);
    }
    return;
  }

  const defaults = [
    {
      title: "Freshly Baked",
      titleAccent: "Cookies",
      tag: "Bestseller",
      description:
        "Irresistible homemade cookies baked fresh daily with premium butter and finest ingredients. From classic choco-chip to exotic flavours — pure indulgence in every bite.",
      image:
        "https://images.pexels.com/photos/890577/pexels-photo-890577.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      ctaText: "Shop Cookies",
      ctaLink: "/shop?category=Cookies",
      badge1: "Freshly Baked",
      badge2: "Premium Butter",
      order: 1,
      isActive: true,
    },
    {
      title: "Decadent Fudge",
      titleAccent: "Brownies",
      tag: "New Arrival",
      description:
        "Rich, moist and intensely chocolatey brownies made with Belgian cocoa. Our special and classic brownies are the ultimate treat for every chocolate lover.",
      image:
        "https://images.pexels.com/photos/3026804/pexels-photo-3026804.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      ctaText: "Shop Brownies",
      ctaLink: "/shop?category=Brownie",
      badge1: "Belgian Cocoa",
      badge2: "Eggless Options",
      order: 2,
      isActive: true,
    },
    {
      title: "Celebration",
      titleAccent: "Cakes",
      tag: "Premium",
      description:
        "Handcrafted cakes for every occasion — birthdays, anniversaries, and festive moments. Made fresh to order with love and the finest ingredients from Madurai.",
      image:
        "https://images.pexels.com/photos/1854652/pexels-photo-1854652.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      ctaText: "Shop Cakes",
      ctaLink: "/shop?category=Cake",
      badge1: "Made to Order",
      badge2: "Fresh Cream",
      order: 3,
      isActive: true,
    },
  ];

  seedingPromise = HeroSlide.insertMany(defaults).then(() => {
    console.log("✅ Default hero slides seeded");
    seedingPromise = null;
  });
  return seedingPromise;
};

/* ────────── GET — public, fetch active slides ────────── */
export async function GET(req: Request) {
  try {
    await connectDB();
    await seedDefaults();

    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly");

    const query: any = {};
    if (activeOnly === "true") query.isActive = true;

    const slides = await HeroSlide.find(query).sort({
      order: 1,
      createdAt: -1,
    });

    // Resolve Cloudinary public IDs → URLs
    const slidesWithUrls = slides.map((s: any) => ({
      ...s._doc,
      image:
        s.image && !s.image.startsWith("http")
          ? getUrlFromPublicId(s.image)
          : s.image,
    }));

    return NextResponse.json({ success: true, data: slidesWithUrls });
  } catch (error: any) {
    console.error("GET hero-slides error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

/* ────────── POST — admin-only, create a new slide ────────── */
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type");
    if (contentType?.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;
        const result = await uploadToCloudinary(
          base64Image,
          "sainandhini/hero",
        );
        return NextResponse.json(result);
      }
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const body = await req.json();
    await connectDB();

    const {
      title,
      titleAccent,
      tag,
      description,
      image,
      ctaText,
      ctaLink,
      badge1,
      badge2,
      isActive,
      order,
    } = body;

    if (!title || !image) {
      return NextResponse.json(
        { success: false, message: "Title and Image are required" },
        { status: 400 },
      );
    }

    // Handle image upload (base64 → Cloudinary)
    let imageValue = image;
    if (image.startsWith("data:image")) {
      const result = await uploadToCloudinary(image, "sainandhini/images/hero");
      imageValue = result.public_id;
    }

    const slide = new HeroSlide({
      title,
      titleAccent,
      tag,
      description,
      image: imageValue,
      ctaText,
      ctaLink,
      badge1,
      badge2,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    });

    await slide.save();

    return NextResponse.json({
      success: true,
      message: "Slide created",
      data: {
        ...slide._doc,
        image:
          slide.image && !slide.image.startsWith("http")
            ? getUrlFromPublicId(slide.image)
            : slide.image,
      },
    });
  } catch (error: any) {
    console.error("POST hero-slides error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
