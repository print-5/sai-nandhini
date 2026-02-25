import mongoose, { Schema, model, models } from "mongoose";

const SettingsSchema = new Schema(
  {
    shopName: { type: String, default: "Sai Nandhini Tasty World" },
    contactEmail: { type: String, default: "info@sainandhini.com" },
    contactPhone: { type: String, default: "+91 96009 16065" },
    address: {
      type: String,
      default:
        "# 3/81, 1st Floor, Kaveri Main Street, SRV Nagar, Thirunagar, Madurai - 625006",
    },
    taxRates: [
      {
        name: { type: String, required: true },
        rate: { type: Number, required: true }, // Percentage
        isDefault: { type: Boolean, default: false },
      },
    ],
    freeShippingThreshold: { type: Number, default: 500 },
    shippingFee: { type: Number, default: 50 },
    announcement: {
      type: String,
      default: "Free delivery on orders above ₹500!",
    },
    minOrderValue: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    manageInventory: { type: Boolean, default: true },
    logo: { type: String, default: "" },
    favicon: { type: String, default: "" },
    socialMedia: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
    },
    shippingByWeight: { type: Boolean, default: false },
    allowOrderCancellation: { type: Boolean, default: true },
    allowScheduledOrders: { type: Boolean, default: false },
    isMaintenanceMode: { type: Boolean, default: false },
    seo: {
      metaTitle: {
        type: String,
        default: "Sai Nandhini Tasty World - Authentic Pickles & Sweets",
      },
      metaDescription: {
        type: String,
        default:
          "Discover the authentic taste of South India with our homemade pickles, sweets, and snacks. Freshly made and delivered to your doorstep.",
      },
      keywords: {
        type: String,
        default: "pickles, sweets, snacks, homemade, indian food, authentic",
      },
      ogImage: { type: String, default: "" },
    },
    payment: {
      razorpayKeyId: { type: String, default: "" },
      razorpayKeySecret: { type: String, default: "" },
    },
    smtp: {
      host: { type: String, default: "" },
      port: { type: Number, default: 587 },
      secure: { type: Boolean, default: false },
      user: { type: String, default: "" },
      password: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  },
);

const Settings = models.Settings || model("Settings", SettingsSchema);

export default Settings;
