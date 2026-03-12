import Review from "../models/Review.js";
import Product from "../models/Product.js";

export const getAdminReviews = async (req, res) => {
    try {
        const filter = req.query.filter || "all";
        let query = {};
        if (filter === "pending") query.isApproved = false;
        else if (filter === "approved") query.isApproved = true;

        const reviews = await Review.find(query)
            .populate("user", "name email")
            .populate("product", "name image")
            .sort("-createdAt");

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
};

export const updateAdminReview = async (req, res) => {
    try {
        const { id, isApproved } = req.body;
        if (!id) return res.status(400).json({ error: "Review ID is required" });

        const review = await Review.findByIdAndUpdate(id, { isApproved }, { new: true });
        if (!review) return res.status(404).json({ error: "Review not found" });

        const allApprovedReviews = await Review.find({ product: review.product, isApproved: true });
        const numReviews = allApprovedReviews.length;
        const totalRating = allApprovedReviews.reduce((acc, item) => acc + item.rating, 0);
        const averageRating = numReviews > 0 ? totalRating / numReviews : 0;

        await Product.findByIdAndUpdate(review.product, {
            rating: Number(averageRating.toFixed(1)),
            numReviews,
        });

        res.json(review);
    } catch (error) {
        res.status(500).json({ error: "Failed to update review" });
    }
};

export const deleteAdminReview = async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) return res.status(400).json({ error: "Review ID is required" });

        const review = await Review.findByIdAndDelete(id);

        if (review && review.isApproved) {
            const allApprovedReviews = await Review.find({ product: review.product, isApproved: true });
            const numReviews = allApprovedReviews.length;
            const totalRating = allApprovedReviews.reduce((acc, item) => acc + item.rating, 0);
            const averageRating = numReviews > 0 ? totalRating / numReviews : 0;

            await Product.findByIdAndUpdate(review.product, {
                rating: Number(averageRating.toFixed(1)),
                numReviews,
            });
        }

        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete review" });
    }
};
