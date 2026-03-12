import dotenv from 'dotenv';
dotenv.config({ path: "../.env" });
dotenv.config(); // Also try the local .env

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';

import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import enquiryRoutes from './routes/enquiryRoutes.js';
import findPlaceRoutes from './routes/findPlaceRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import heroSlideRoutes from './routes/heroSlideRoutes.js';
import shippingRateRoutes from './routes/shippingRateRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import adminSettingsRoutes from './routes/adminSettingsRoutes.js';
import adminUOMRoutes from './routes/adminUOMRoutes.js';
import adminSubcategoryRoutes from './routes/adminSubcategoryRoutes.js';
import adminCustomersRoutes from './routes/adminCustomersRoutes.js';
import adminCategoriesRoutes from './routes/adminCategoriesRoutes.js';
import adminOrdersRoutes from './routes/adminOrdersRoutes.js';
import adminCouponsRoutes from './routes/adminCouponsRoutes.js';
import adminEnquiriesRoutes from './routes/adminEnquiriesRoutes.js';
import adminReviewsRoutes from './routes/adminReviewsRoutes.js';
import adminMiscRoutes from './routes/adminMiscRoutes.js';

dotenv.config({ path: "../.env" });
dotenv.config(); // Also try the local .env

const MONGODB_URI = process.env.MONGODB_URI;
console.log(`Connecting to: ${MONGODB_URI ? MONGODB_URI.split('@')[1] : "NOT FOUND"}`);

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());

// Limit increased since we are expecting large base64 image strings
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Connect to MongoDB
connectDB()
    .then(() => {
        console.log("MongoDB Connected Successfully");
    })
    .catch((err) => {
        console.error(`MongoDB Connection Error: ${err.message}`);
        process.exit(1);
    });

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        db: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
        message: "Backend is running",
    });
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/enquiry', enquiryRoutes);
app.use('/api/find-place', findPlaceRoutes);
app.use('/api/page', pageRoutes);

// Public settings endpoint (for navbar, footer, etc.)
app.use('/api/settings', adminSettingsRoutes);

// Admin Specific Routes
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/admin/hero-slides', heroSlideRoutes);
app.use('/api/admin/shipping-rates', shippingRateRoutes);
app.use('/api/admin/inventory', inventoryRoutes);
app.use('/api/admin/uom', adminUOMRoutes);
app.use('/api/admin/subcategories', adminSubcategoryRoutes);
app.use('/api/admin/customers', adminCustomersRoutes);
app.use('/api/admin/categories', adminCategoriesRoutes);
app.use('/api/admin/orders', adminOrdersRoutes);
app.use('/api/admin/coupons', adminCouponsRoutes);
app.use('/api/admin/enquiries', adminEnquiriesRoutes);
app.use('/api/admin/reviews', adminReviewsRoutes);
app.use('/api/admin', adminRoutes); // covers generic admin stats/analytics
app.use('/api/admin', adminMiscRoutes); // Covers /page and /reports/orders

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
