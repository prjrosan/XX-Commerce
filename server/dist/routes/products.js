"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const init_1 = require("../database/init");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    try {
        const { category, search, sort = "created_at", order = "desc", page = 1, limit = 20 } = req.query;
        let query = "SELECT * FROM products WHERE 1=1";
        const params = [];
        if (category && category !== "all") {
            query += " AND category = ?";
            params.push(category);
        }
        if (search) {
            query += " AND (name LIKE ? OR description LIKE ?)";
            params.push(`%${search}%`, `%${search}%`);
        }
        query += ` ORDER BY ${sort} ${String(order).toUpperCase()}`;
        const offset = (Number(page) - 1) * Number(limit);
        query += " LIMIT ? OFFSET ?";
        params.push(Number(limit), offset);
        let countQuery = "SELECT COUNT(*) as total FROM products WHERE 1=1";
        const countParams = [];
        if (category && category !== "all") {
            countQuery += " AND category = ?";
            countParams.push(category);
        }
        if (search) {
            countQuery += " AND (name LIKE ? OR description LIKE ?)";
            countParams.push(`%${search}%`, `%${search}%`);
        }
        const [countResult] = await init_1.db.execute(countQuery, countParams);
        const total = countResult[0].total;
        const [products] = await init_1.db.execute(query, params);
        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [products] = await init_1.db.execute("SELECT * FROM products WHERE id = ?", [id]);
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json({
            success: true,
            data: products[0]
        });
    }
    catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/", auth_1.authenticateToken, auth_1.requireAdminOrSeller, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, description, price, category, image, stock } = req.body;
        const userId = req.user?.id;
        const query = `INSERT INTO products (name, description, price, category, image, stock, seller_id) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await init_1.db.execute(query, [name, description, price, category, image, stock, userId]);
        const productId = result.insertId;
        res.status(201).json({
            success: true,
            data: { id: productId, name, description, price, category, image, stock, seller_id: userId }
        });
    }
    catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.put("/:id", auth_1.authenticateToken, auth_1.requireAdminOrSeller, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, image, stock } = req.body;
        const userId = req.user?.id;
        const [products] = await init_1.db.execute("SELECT seller_id FROM products WHERE id = ?", [id]);
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        const product = products[0];
        if (req.user?.role !== "admin" && product.seller_id !== userId) {
            return res.status(403).json({ error: "Not authorized to update this product" });
        }
        const query = `UPDATE products SET name = ?, description = ?, price = ?, 
                   category = ?, image = ?, stock = ? WHERE id = ?`;
        await init_1.db.execute(query, [name, description, price, category, image, stock, id]);
        res.json({
            success: true,
            data: { id, name, description, price, category, image, stock }
        });
    }
    catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.delete("/:id", auth_1.authenticateToken, auth_1.requireAdminOrSeller, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const [products] = await init_1.db.execute("SELECT seller_id FROM products WHERE id = ?", [id]);
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        const product = products[0];
        if (req.user?.role !== "admin" && product.seller_id !== userId) {
            return res.status(403).json({ error: "Not authorized to delete this product" });
        }
        await init_1.db.execute("DELETE FROM products WHERE id = ?", [id]);
        res.json({
            success: true,
            message: "Product deleted successfully"
        });
    }
    catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
//# sourceMappingURL=products.js.map