import HeroSlide from "../models/HeroSlide.js";
import { v2 as cloudinary } from "cloudinary";

// Ensure cloudinary handles base64 easily
const uploadToCloudinary = async (base64Image, folder) => {
    try {
        const result = await cloudinary.uploader.upload(base64Image, {
            folder: folder,
        });
        return { secure_url: result.secure_url, public_id: result.public_id };
    } catch (error) {
        throw new Error("Failed to upload image to Cloudinary");
    }
}

// Convert public id back to url
const getUrlFromPublicId = (publicId) => {
    return cloudinary.url(publicId, {
        secure: true,
        fetch_format: "auto",
        quality: "auto",
    });
};

// @desc    Get Hero Slides
// @route   GET /api/hero-slides
// @access  Public
export const getHeroSlides = async (req, res) => {
    try {
        const activeOnly = req.query.activeOnly;
        const query = {};
        if (activeOnly === "true") query.isActive = true;

        const slides = await HeroSlide.find(query).sort({
            order: 1,
            createdAt: -1,
        });

        const slidesWithUrls = slides.map((s) => ({
            ...s._doc,
            image: s.image && !s.image.startsWith("http")
                ? getUrlFromPublicId(s.image)
                : s.image,
        }));

        res.json({ success: true, data: slidesWithUrls });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// @desc    Create Hero Slide
// @route   POST /api/hero-slides
// @access  Private/Admin
export const createHeroSlide = async (req, res) => {
    try {
        // Express body contains JSON or FormData if multer is used.
        // Assuming body.data and body.imageBase64 based on the form-data simplification logic.
        const {
            title, titleAccent, tag, description, ctaText, ctaLink,
            badge1, badge2, isActive, order, imageBase64, image
        } = req.body;

        let imageValue = image;

        if (imageBase64) {
            const result = await uploadToCloudinary(imageBase64, "sainandhini/hero");
            imageValue = result.public_id;
        }

        if (!title || !imageValue) {
            return res.status(400).json({ success: false, message: "Title and Image are required" });
        }

        const slide = new HeroSlide({
            title, titleAccent, tag, description,
            image: imageValue,
            ctaText, ctaLink, badge1, badge2,
            isActive: isActive === true || isActive === 'true',
            order: Number(order) || 0,
        });

        await slide.save();

        res.status(201).json({
            success: true,
            data: {
                ...slide._doc,
                image: slide.image && !slide.image.startsWith("http")
                    ? getUrlFromPublicId(slide.image)
                    : slide.image,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
