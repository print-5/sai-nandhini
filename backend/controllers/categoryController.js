import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Category from "../models/Category.js";

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
    try {
        console.log("Fetching categories from db:", mongoose.connection.name);
        // Explicitly ensuring connection is ready
        if (mongoose.connection.readyState !== 1) {
            await connectDB();
        }
        const categories = await Category.find();
        console.log("Found categories count:", categories.length);
        res.json(categories);
    } catch (error) {
        console.error("Error in getCategories:", error);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
    try {
        const body = req.body;
        const category = await Category.create(body);
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
