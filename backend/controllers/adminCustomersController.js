import { getCustomersWithStats, getCustomerByPhone } from "../utils/adminData.js";

// @desc    Get Customers or specific customer by phone
// @route   GET /api/admin/customers
// @access  Private/Admin
export const getCustomers = async (req, res) => {
    try {
        const phone = req.query.phone;

        if (phone) {
            const customer = await getCustomerByPhone(phone);
            if (!customer) return res.json(null);
            return res.json(customer);
        }

        const customersWithStats = await getCustomersWithStats();
        res.json(customersWithStats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
