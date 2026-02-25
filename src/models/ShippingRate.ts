import mongoose, { Schema, model, models } from "mongoose";

const ShippingRateSchema = new Schema(
  {
    minAmount: { type: Number, required: true }, // in currency
    maxAmount: { type: Number, required: true }, // in currency
    rate: { type: Number, required: true }, // in currency
  },
  {
    timestamps: true,
  },
);

const ShippingRate =
  models.ShippingRate || model("ShippingRate", ShippingRateSchema);

export default ShippingRate;
