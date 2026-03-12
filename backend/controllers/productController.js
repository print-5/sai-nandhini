import Product from "../models/Product.js";
import Settings from "../models/Settings.js";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import { v2 as cloudinary } from "cloudinary";

// Configure cloudinary (make sure to set env variables)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(base64Image, folder) {
    try {
        const result = await cloudinary.uploader.upload(base64Image, {
            folder: folder,
        });
        return { secure_url: result.secure_url, public_id: result.public_id };
    } catch (error) {
        throw new Error("Failed to upload image to Cloudinary");
    }
}

export const getProducts = async (req, res) => {
    try {
        const { category, admin, exclude, limit } = req.query;
        const isAdmin = admin === "true";

        const query = category ? { category } : {};

        if (!isAdmin) {
            query.isActive = true;
        }

        if (exclude) {
            query._id = { $ne: exclude };
        }

        if (!isAdmin) {
            const settings = await Settings.findOne();
            if (settings?.manageInventory ?? true) {
                query.$or = [{ stock: { $gt: 0 } }, { "variants.stock": { $gt: 0 } }];
            }
        }

        let productsQuery = Product.find(query);

        if (limit) {
            productsQuery = productsQuery.limit(parseInt(limit));
        }

        const products = await productsQuery.exec();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        // Admin check is assumed to be done by middleware before reaching here

        // Express doesn't parse req.formData() natively, you'd use multer
        // Let's assume frontend sends JSON body with base64 images to simplify 
        // OR we can use multer. For now, since it's an Express backend, handling FormData usually requires `multer`.
        // Let's implement a JSON based approach or simple extraction assuming body contains base64:

        // For standard multipart/form-data we would use `multer`.
        // I will write this assuming `req.body.data` contains product info and images are pre-processed or base64.
        const body = req.body;

        if (!body.name || !body.price) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Process base64 images if they exist in the payload
        if (body.imagesToUpload && Array.isArray(body.imagesToUpload)) {
            const uploadedUrls = [];
            for (const base64Image of body.imagesToUpload) {
                const { secure_url } = await uploadToCloudinary(
                    base64Image,
                    "sainandhini/products"
                );
                uploadedUrls.push(secure_url);
            }
            body.images = [...(body.images || []), ...uploadedUrls];
        }

        const product = await Product.create(body);
        res.status(201).json(product);
    } catch (error) {

        res.status(500).json({ error: error.message });
    }
};

// @desc    Get approved reviews for a product + rating stats + canReview flag
// @route   GET /api/products/:id/reviews
// @access  Public
export const getProductReviews = async (req, res) => {
    try {
        const { id } = req.params;

        // Execute queries in parallel for better performance
        const [reviews, canReviewData] = await Promise.all([
            // Get reviews
            Review.find({ product: id, isApproved: true })
                .populate("user", "name")
                .sort({ createdAt: -1 }),
            
            // Check if user can review (only if user is logged in)
            req.user ? Promise.all([
                Order.findOne({
                    user: req.user._id,
                    "orderItems.product": id,
                    isDelivered: true,
                }),
                Review.findOne({
                    product: id,
                    user: req.user._id,
                })
            ]) : Promise.resolve([null, null])
        ]);

        // Build rating breakdown
        const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let totalRating = 0;
        reviews.forEach((r) => {
            ratingBreakdown[r.rating] = (ratingBreakdown[r.rating] || 0) + 1;
            totalRating += r.rating;
        });
        const averageRating =
            reviews.length > 0
                ? parseFloat((totalRating / reviews.length).toFixed(1))
                : 0;

        // Determine if user can review
        let canReview = false;
        if (req.user && canReviewData) {
            const [order, alreadyReviewed] = canReviewData;
            canReview = !!order && !alreadyReviewed;
        }

        const formattedReviews = reviews.map((r) => ({
            _id: r._id,
            rating: r.rating,
            comment: r.comment,
            userName: r.user?.name || "Anonymous",
            createdAt: r.createdAt,
        }));

        res.json({
            reviews: formattedReviews,
            stats: {
                averageRating,
                totalReviews: reviews.length,
                ratingBreakdown,
            },
            canReview,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Submit a product review (pending approval)
// @route   POST /api/products/reviews
// @access  Private
export const submitProductReview = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Please login to submit a review" });
        }

        const { productId, rating, comment } = req.body;

        if (!productId || !rating || !comment?.trim()) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5" });
        }

        // Check if user already reviewed this product
        const existing = await Review.findOne({ product: productId, user: req.user._id });
        if (existing) {
            return res.status(400).json({ error: "You have already reviewed this product" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const review = await Review.create({
            product: productId,
            user: req.user._id,
            rating: Number(rating),
            comment: comment.trim(),
            isApproved: false, // Needs admin approval
        });

        res.status(201).json({ message: "Review submitted! It will appear after approval.", review });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
