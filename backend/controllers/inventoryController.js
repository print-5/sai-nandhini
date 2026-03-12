import Product from "../models/Product.js";
import StockTransaction from "../models/StockTransaction.js";

// @desc    Get inventory transactions
// @route   GET /api/inventory
// @access  Public ? Wait, Next.js left this unprotected but typically it should be protected.
export const getInventoryTransactions = async (req, res) => {
    try {
        const productId = req.query.productId;
        const query = productId ? { product: productId } : {};
        const transactions = await StockTransaction.find(query)
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// @desc    Create a new inventory transaction
// @route   POST /api/inventory
// @access  Private/Admin
export const createInventoryTransaction = async (req, res) => {
    try {
        const {
            productId,
            variantSku,
            type,
            quantity,
            reason,
            costPerUnit,
            supplier,
        } = req.body;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: "Product not found" });

        let previousStock = 0;
        let newStock = 0;
        let stockIndex = -1;

        if (product.variants && product.variants.length > 0) {
            if (!variantSku) {
                return res.status(400).json({ error: "Variant SKU is required for variant products" });
            }

            stockIndex = product.variants.findIndex((v) => v.uom === variantSku);
            if (stockIndex === -1) return res.status(404).json({ error: "Variant not found" });

            previousStock = product.variants[stockIndex].stock || 0;
        } else {
            previousStock = product.stock || 0;
        }

        newStock = previousStock + Number(quantity);
        if (newStock < 0) newStock = 0;

        if (stockIndex !== -1) {
            product.variants[stockIndex].stock = newStock;
        } else {
            product.stock = newStock;
        }
        await product.save();

        const transaction = await StockTransaction.create({
            product: productId,
            productName: product.name,
            variantSku: variantSku || null,
            type,
            quantity: Number(quantity),
            previousStock,
            newStock,
            reason,
            costPerUnit,
            supplier,
        });

        res.json({ success: true, transaction, newStock });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
