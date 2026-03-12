import ShippingRate from "../models/ShippingRate.js";

// @desc    Get all shipping rates
// @route   GET /api/shipping-rates
// @access  Public
export const getShippingRates = async (req, res) => {
    try {
        const rates = await ShippingRate.find().sort({ location: 1 });
        res.json(rates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// @desc    Create a shipping rate
// @route   POST /api/shipping-rates
// @access  Private/Admin
export const createShippingRate = async (req, res) => {
    try {
        const body = req.body;
        const existingRate = await ShippingRate.findOne({ location: body.location });
        if (existingRate) {
            return res.status(400).json({ error: "Shipping rate for this location already exists" });
        }

        const rate = await ShippingRate.create(body);
        res.status(201).json(rate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// @desc    Update a shipping rate
// @route   PUT /api/shipping-rates/:id
// @access  Private/Admin
export const updateShippingRate = async (req, res) => {
    try {
        const body = req.body;

        // Express usually targets :id param, but to support the legacy payload body._id
        const idToUpdate = req.params.id || body._id;

        const rate = await ShippingRate.findByIdAndUpdate(
            idToUpdate,
            {
                rate: body.rate,
                estimatedDelivery: body.estimatedDelivery,
            },
            { new: true }
        );

        if (!rate) {
            return res.status(404).json({ error: "Shipping rate not found" });
        }

        res.json(rate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
