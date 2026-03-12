import Order from "../models/Order.js";

export const getAdminOrders = async (req, res) => {
    try {
        const status = req.query.status;
        const query = status && status !== "All" ? { status } : {};
        const orders = await Order.find(query).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateAdminOrdersBulk = async (req, res) => {
    try {
        const { orderIds, status } = req.body;
        if (!orderIds || !Array.isArray(orderIds) || !status) {
            return res.status(400).json({ error: "Missing orderIds or status" });
        }

        const updateData = { status };
        if (status === "Delivered") {
            updateData.isDelivered = true;
            updateData.deliveredAt = Date.now();
        }

        await Order.updateMany({ _id: { $in: orderIds } }, { $set: updateData });
        res.json({ message: "Orders updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateAdminOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const existingOrder = await Order.findById(id);
        if (!existingOrder) return res.status(404).json({ error: "Order not found" });

        const updateData = {};
        let statusChanged = false;
        const body = req.body;

        if (body.status && body.status !== existingOrder.status) {
            statusChanged = true;
            updateData.status = body.status;
            if (body.status === "Delivered") {
                updateData.isDelivered = true;
                updateData.deliveredAt = Date.now();
            } else {
                updateData.isDelivered = false;
                updateData.deliveredAt = null;
            }
        }

        if (body.awbNumber) updateData.awbNumber = body.awbNumber;
        if (body.isDelivered !== undefined) {
            updateData.isDelivered = body.isDelivered;
            updateData.deliveredAt = body.isDelivered ? Date.now() : null;
            if (body.isDelivered) updateData.status = "Delivered";
        }
        if (body.isPaid !== undefined) {
            updateData.isPaid = body.isPaid;
            updateData.paidAt = body.isPaid ? Date.now() : null;
        }

        const order = await Order.findByIdAndUpdate(id, updateData, { new: true });
        if (!order) return res.status(404).json({ error: "Order not found" });

        if (statusChanged) {
            // Here we could invoke email service just like Next.js did
            // Email service needs to be fully migrated though. Assuming it exists or omitted for now.
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
