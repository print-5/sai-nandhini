import fetch from "node-fetch";

// @desc    Get Google Place details
// @route   GET /api/find-place
// @access  Public
export const findPlace = async (req, res) => {
    try {
        const query = req.query.query;
        const key = req.query.key;

        if (!query || !key) {
            return res.status(400).json({ error: "Missing query or API key" });
        }

        const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,formatted_address,rating,user_ratings_total&key=${key}`;

        const response = await fetch(url);
        const data = await response.json();

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message || "Failed to fetch place data" });
    }
};
