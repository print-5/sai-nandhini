import UOM from "../models/UOM.js";

export const getUOMs = async (req, res) => {
    try {
        const uoms = await UOM.find({}).sort({ name: 1 });
        res.json(uoms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createUOM = async (req, res) => {
    try {
        const { name, code, isActive } = req.body;
        const finalCode = code || name.toLowerCase().replace(/\s+/g, "");

        const existing = await UOM.findOne({ $or: [{ name }, { code: finalCode }] });
        if (existing) {
            return res.status(400).json({ error: "UOM with this name or code already exists" });
        }

        const uom = await UOM.create({
            name,
            code: finalCode,
            isActive: isActive !== undefined ? isActive : true,
        });

        res.status(201).json(uom);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
