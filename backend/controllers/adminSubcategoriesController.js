import SubCategory from "../models/SubCategory.js";

export const getSubcategories = async (req, res) => {
    try {
        const categoryId = req.query.categoryId;
        const query = categoryId ? { parentCategory: categoryId } : {};
        const subCategories = await SubCategory.find(query).populate("parentCategory", "name");
        res.json(subCategories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createSubcategory = async (req, res) => {
    try {
        const { name, categoryId, description } = req.body;
        const slug = name.toLowerCase().replace(/\s+/g, "-");

        const subCategory = await SubCategory.create({
            name,
            slug,
            parentCategory: categoryId,
            description,
        });

        res.status(201).json(subCategory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteSubcategory = async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) return res.status(400).json({ error: "Subcategory ID is required" });

        const deletedSubCategory = await SubCategory.findByIdAndDelete(id);
        if (!deletedSubCategory) return res.status(404).json({ error: "Subcategory not found" });

        res.json({ message: "Subcategory deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
