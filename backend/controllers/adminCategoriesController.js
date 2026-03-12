import Category from "../models/Category.js";
import { getCategoriesData } from "../utils/adminData.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

const uploadToCloudinary = async (base64Image, folder) => {
    try {
        const result = await cloudinary.uploader.upload(base64Image, {
            folder: folder,
        });
        return { secure_url: result.secure_url, public_id: result.public_id };
    } catch (error) {
        throw new Error("Failed to upload image to Cloudinary");
    }
};

export const getAdminCategories = async (req, res) => {
    try {
        const categories = await getCategoriesData();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createAdminCategory = async (req, res) => {
    try {
        let { name, slug, description, image, imageBase64 } = req.body;
        let imageUrl = image;

        if (imageBase64) {
            const result = await uploadToCloudinary(imageBase64, "sainandhini/categories");
            imageUrl = result.secure_url;
        }

        if (!name || !slug) {
            return res.status(400).json({ error: "Name and Slug are required" });
        }

        const existing = await Category.findOne({ slug });
        if (existing) {
            return res.status(400).json({ error: "Category already exists" });
        }

        const category = await Category.create({ name, slug, image: imageUrl, description });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateAdminCategory = async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) return res.status(400).json({ error: "Category ID is required" });

        let { name, slug, description, image, imageBase64 } = req.body;
        let imageUrl = image;

        if (imageBase64) {
            const result = await uploadToCloudinary(imageBase64, "sainandhini/categories");
            imageUrl = result.secure_url;
        }

        if (!name || !slug) {
            return res.status(400).json({ error: "Name and Slug are required" });
        }

        const existing = await Category.findOne({ slug, _id: { $ne: id } });
        if (existing) {
            return res.status(400).json({ error: "Category slug already exists" });
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name, slug, image: imageUrl, description },
            { new: true }
        );

        if (!updatedCategory) return res.status(404).json({ error: "Category not found" });
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteAdminCategory = async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) return res.status(400).json({ error: "Category ID is required" });

        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) return res.status(404).json({ error: "Category not found" });

        const SubCategory = mongoose.models.SubCategory || mongoose.model("SubCategory");
        if (SubCategory) {
            await SubCategory.deleteMany({ parentCategory: id });
        }

        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
