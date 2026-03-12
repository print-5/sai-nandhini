import Page from "../models/Page.js";

// @desc    Get Page by slug
// @route   GET /api/page
// @access  Public
export const getPage = async (req, res) => {
    try {
        const slug = req.query.slug;

        if (!slug) {
            return res.status(400).json({ error: "Slug is required" });
        }

        const page = await Page.findOne({ slug });

        if (!page) {
            return res.status(404).json({ message: "Page not found" });
        }

        res.json(page);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
