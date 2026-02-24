import mongoose, { Schema, model, models } from "mongoose";

const CouponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed", "free-delivery"],
      required: true,
    },
    value: {
      type: Number,
      required: function (this: any) {
        return this.type !== "free-delivery";
      },
      default: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number,
    },
    expiryDate: {
      type: Date,
    },
    usageLimit: {
      type: Number,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayInCheckout: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster lookups by code
CouponSchema.index({ code: 1 });

const Coupon = models.Coupon || model("Coupon", CouponSchema);

export default Coupon;
