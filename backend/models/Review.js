import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const ReviewSchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

// Performance Indexes
ReviewSchema.index({ product: 1 });
ReviewSchema.index({ user: 1 });
ReviewSchema.index({ isApproved: 1 });
ReviewSchema.index({ product: 1, isApproved: 1 });
ReviewSchema.index({ user: 1, product: 1 });
ReviewSchema.index({ createdAt: -1 });

const Review = models.Review || model("Review", ReviewSchema);

export default Review;
