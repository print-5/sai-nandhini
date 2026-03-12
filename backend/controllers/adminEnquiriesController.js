import Enquiry from "../models/Enquiry.js";

export const getAdminEnquiries = async (req, res) => {
    try {
        const enquiries = await Enquiry.find({}).sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateAdminEnquiry = async (req, res) => {
    try {
        const { id, status } = req.body;
        if (!id || !status) return res.status(400).json({ error: "ID and status are required" });

        const enquiry = await Enquiry.findByIdAndUpdate(id, { status }, { new: true });
        if (!enquiry) return res.status(404).json({ error: "Enquiry not found" });

        res.json(enquiry);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
