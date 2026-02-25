import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Settings from "@/models/Settings";
import { decryptPassword } from "@/lib/encryption";

// Cache reviews for 1 hour to avoid hitting API rate limits
let cachedReviews: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function GET() {
  try {
    console.log("=== Google Reviews API Called ===");

    // Check cache first
    const now = Date.now();
    if (cachedReviews && now - cacheTimestamp < CACHE_DURATION) {
      console.log("Returning cached reviews");
      return NextResponse.json({
        reviews: cachedReviews.reviews,
        averageRating: cachedReviews.averageRating,
        totalReviewCount: cachedReviews.totalReviewCount,
        cached: true,
      });
    }

    await connectDB();
    const settings = await Settings.findOne();
    console.log("Settings found:", {
      enabled: settings?.googleMyBusiness?.enabled,
      hasPlaceId: !!settings?.googleMyBusiness?.placeId,
      hasApiKey: !!settings?.googleMyBusiness?.apiKey,
    });

    if (!settings?.googleMyBusiness?.enabled) {
      console.log("Google reviews not enabled in settings");
      return NextResponse.json({
        reviews: [],
        averageRating: 0,
        totalReviewCount: 0,
        error: "Google reviews are not enabled",
      });
    }

    const { placeId, apiKey } = settings.googleMyBusiness;

    if (!placeId || !apiKey) {
      console.log("Missing credentials:", {
        hasPlaceId: !!placeId,
        hasApiKey: !!apiKey,
      });
      return NextResponse.json({
        reviews: [],
        averageRating: 0,
        totalReviewCount: 0,
        error: "Google API credentials are incomplete",
      });
    }

    // Decrypt API key
    const decryptedApiKey = decryptPassword(apiKey);
    console.log("API Key decrypted, Place ID:", placeId);

    // Fetch place details with reviews from Google Places API
    const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews&key=${decryptedApiKey}`;
    console.log("Fetching from Google Places API...");

    const response = await fetch(apiUrl);
    console.log("Google API response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Google Places API error:", errorData);

      return NextResponse.json({
        reviews: [],
        averageRating: 0,
        totalReviewCount: 0,
        error: `Failed to fetch reviews: ${response.statusText}`,
      });
    }

    const data = await response.json();
    console.log("Google API response status:", data.status);

    if (data.status !== "OK") {
      console.error("Google Places API error:", data);
      return NextResponse.json({
        reviews: [],
        averageRating: 0,
        totalReviewCount: 0,
        error: `API Error: ${data.status} - ${data.error_message || "Unknown error"}`,
      });
    }

    const result = data.result;
    console.log("Reviews found:", result.reviews?.length || 0);

    // Transform Google reviews to our format
    const transformedReviews = (result.reviews || []).map((review: any) => ({
      id: review.time.toString(),
      rating: review.rating,
      comment: review.text || "",
      userName: review.author_name || "Anonymous",
      userPhoto: review.profile_photo_url || "",
      createdAt: new Date(review.time * 1000).toISOString(),
      source: "google",
    }));

    // Cache the results
    cachedReviews = {
      reviews: transformedReviews,
      averageRating: result.rating || 0,
      totalReviewCount: result.user_ratings_total || 0,
    };
    cacheTimestamp = now;

    console.log("Returning reviews:", {
      count: transformedReviews.length,
      averageRating: result.rating,
      totalReviews: result.user_ratings_total,
    });

    return NextResponse.json({
      reviews: transformedReviews,
      averageRating: result.rating || 0,
      totalReviewCount: result.user_ratings_total || 0,
      cached: false,
    });
  } catch (error: any) {
    console.error("Error fetching Google reviews:", error);
    return NextResponse.json(
      {
        reviews: [],
        averageRating: 0,
        totalReviewCount: 0,
        error: error.message || "Failed to fetch Google reviews",
      },
      { status: 500 },
    );
  }
}
