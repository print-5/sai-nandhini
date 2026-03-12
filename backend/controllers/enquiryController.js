import Enquiry from "../models/Enquiry.js";

// @desc    Create Enquiry 
// @route   POST /api/enquiries 
// @access  Public 
export const createEnquiry = async (req, res) => {
    try {
        const body = req.body;

        if (!body.name || !body.email || !body.phone || !body.message) {
            return res.status(400).json({ error: "Please fill in all required fields" });
        }

        const enquiry = await Enquiry.create(body);

        res.status(201).json({ message: "Enquiry submitted successfully", enquiry });
    } catch (error) {
        res.status(500).json({ error: error.message || "Something went wrong" });
    }
};
