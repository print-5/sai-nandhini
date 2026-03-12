import { getDashboardStats, getAnalyticsData } from "../utils/adminData.js";

// @desc    Get Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
    try {
        const range = req.query.range || "week";
        const data = await getDashboardStats(range);
        res.json(data);
    } catch (error) {
        console.error("Stats API Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get Analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
    try {
        const data = await getAnalyticsData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
