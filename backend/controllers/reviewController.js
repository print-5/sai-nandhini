import connectDB from "../config/db.js";
import Settings from "../models/Settings.js";
import { decryptPassword } from "../utils/encryption.js";
import fetch from "node-fetch";

// Cache reviews for 1 hour to avoid hitting API rate limits
let cachedReviews = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// @desc    Get Google Reviews
// @route   GET /api/reviews/google
// @access  Public
export const getGoogleReviews = async (req, res) => {
    try {
        const now = Date.now();
        if (cachedReviews && now - cacheTimestamp < CACHE_DURATION) {
            return res.json({
                reviews: cachedReviews.reviews,
                averageRating: cachedReviews.averageRating,
                totalReviewCount: cachedReviews.totalReviewCount,
                cached: true,
            });
        }

        const settings = await Settings.findOne();

        if (!settings?.googleMyBusiness?.enabled) {
            return res.json({
                reviews: [],
                averageRating: 0,
                totalReviewCount: 0,
                error: "Google reviews are not enabled",
            });
        }

        const { placeId, apiKey } = settings.googleMyBusiness;

        if (!placeId || !apiKey) {
            return res.json({
                reviews: [],
                averageRating: 0,
                totalReviewCount: 0,
                error: "Google API credentials are incomplete",
            });
        }

        const decryptedApiKey = decryptPassword(apiKey);
        const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews&key=${decryptedApiKey}`;

        // Need node-fetch installed or Use global fetch (Node 18+)
        const response = await fetch(apiUrl);

        if (!response.ok) {
            return res.json({
                reviews: [],
                averageRating: 0,
                totalReviewCount: 0,
                error: `Failed to fetch reviews: ${response.statusText}`,
            });
        }

        const data = await response.json();

        if (data.status !== "OK") {
            return res.json({
                reviews: [],
                averageRating: 0,
                totalReviewCount: 0,
                error: `API Error: ${data.status} - ${data.error_message || "Unknown error"}`,
            });
        }

        const result = data.result;

        const transformedReviews = (result.reviews || []).map((review) => ({
            id: review.time.toString(),
            rating: review.rating,
            comment: review.text || "",
            userName: review.author_name || "Anonymous",
            userPhoto: review.profile_photo_url || "",
            createdAt: new Date(review.time * 1000).toISOString(),
            source: "google",
        }));

        cachedReviews = {
            reviews: transformedReviews,
            averageRating: result.rating || 0,
            totalReviewCount: result.user_ratings_total || 0,
        };
        cacheTimestamp = now;

        return res.json({
            reviews: transformedReviews,
            averageRating: result.rating || 0,
            totalReviewCount: result.user_ratings_total || 0,
            cached: false,
        });
    } catch (error) {
        console.error("Error fetching Google reviews:", error);
        return res.status(500).json({
            reviews: [],
            averageRating: 0,
            totalReviewCount: 0,
            error: error.message || "Failed to fetch Google reviews",
        });
    }
};
