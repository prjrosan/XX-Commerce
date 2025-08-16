"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const init_1 = require("../database/init");
const axios_1 = __importDefault(require("axios"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const demoProducts = [
    {
        title: "Premium Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
        price: 1200,
        category: "electronics",
        image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        stock_quantity: 25,
        customization_options: {
            colors: ["Black", "White", "Blue", "Red"],
            sizes: ["Standard", "Large"],
            engraving: true
        }
    },
    {
        title: "Traditional Japanese Tea Set",
        description: "Beautiful handcrafted ceramic tea set with 6 cups and teapot. Perfect for traditional tea ceremonies.",
        price: 800,
        category: "home",
        image_url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400",
        stock_quantity: 15,
        customization_options: {
            colors: ["White", "Blue", "Green", "Pink"],
            patterns: ["Traditional", "Modern", "Floral"],
            engraving: true
        }
    },
    {
        title: "Smart Fitness Watch",
        description: "Advanced fitness tracking with heart rate monitor, GPS, and water resistance. Track your workouts and health metrics.",
        price: 1400,
        category: "electronics",
        image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
        stock_quantity: 30,
        customization_options: {
            colors: ["Black", "Silver", "Gold", "Rose Gold"],
            bands: ["Silicone", "Leather", "Metal"],
            engraving: true
        }
    },
    {
        title: "Handmade Sushi Knife",
        description: "Professional-grade sushi knife made from high-carbon steel. Perfect for sushi chefs and cooking enthusiasts.",
        price: 900,
        category: "kitchen",
        image_url: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=400",
        stock_quantity: 10,
        customization_options: {
            handle_materials: ["Wood", "Bamboo", "Composite"],
            blade_lengths: ["180mm", "210mm", "240mm"],
            engraving: true
        }
    },
    {
        title: "Organic Matcha Green Tea",
        description: "Premium organic matcha powder from Uji, Japan. Rich in antioxidants and perfect for traditional tea preparation.",
        price: 400,
        category: "food",
        image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
        stock_quantity: 50,
        customization_options: {
            grades: ["Ceremonial", "Premium", "Culinary"],
            sizes: ["30g", "50g", "100g"],
            packaging: ["Tin", "Pouch", "Gift Box"]
        }
    },
    {
        title: "Modern Minimalist Desk Lamp",
        description: "Sleek LED desk lamp with adjustable brightness and color temperature. Perfect for home office or study.",
        price: 600,
        category: "home",
        image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
        stock_quantity: 20,
        customization_options: {
            colors: ["White", "Black", "Silver", "Gold"],
            bases: ["Clamp", "Stand", "Wall Mount"],
            engraving: false
        }
    },
    {
        title: "Yukata Kimono Set",
        description: "Traditional Japanese yukata with obi belt and geta sandals. Perfect for summer festivals and special occasions.",
        price: 1000,
        category: "clothing",
        image_url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400",
        stock_quantity: 12,
        customization_options: {
            patterns: ["Cherry Blossom", "Wave", "Geometric", "Floral"],
            sizes: ["S", "M", "L", "XL"],
            colors: ["Blue", "Pink", "Purple", "Green"]
        }
    },
    {
        title: "Portable Bluetooth Speaker",
        description: "Waterproof portable speaker with 360-degree sound and 12-hour battery life. Perfect for outdoor activities.",
        price: 700,
        category: "electronics",
        image_url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
        stock_quantity: 35,
        customization_options: {
            colors: ["Black", "Blue", "Red", "Yellow"],
            sizes: ["Mini", "Standard", "Large"],
            engraving: true
        }
    }
];
router.post('/init-demo', auth_1.requireAdmin, (req, res) => {
    let insertedCount = 0;
    let errorCount = 0;
    demoProducts.forEach((product) => {
        init_1.db.run('INSERT OR IGNORE INTO products (title, description, price, category, image_url, stock_quantity, external_id) VALUES (?, ?, ?, ?, ?, ?, ?)', [
            product.title,
            product.description,
            product.price,
            product.category,
            product.image_url,
            product.stock_quantity,
            `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        ], function (err) {
            if (err) {
                errorCount++;
            }
            else {
                insertedCount++;
            }
        });
    });
    setTimeout(() => {
        res.json({
            success: true,
            message: 'Demo products initialized',
            data: { inserted: insertedCount, errors: errorCount }
        });
    }, 1000);
});
router.post('/update-prices', auth_1.requireAdmin, (req, res) => {
    let updatedCount = 0;
    let errorCount = 0;
    demoProducts.forEach((product) => {
        init_1.db.run('UPDATE products SET price = ? WHERE title = ?', [product.price, product.title], function (err) {
            if (err) {
                errorCount++;
                console.error('Error updating product price:', err);
            }
            else {
                if (this.changes > 0) {
                    updatedCount++;
                }
            }
        });
    });
    setTimeout(() => {
        res.json({
            success: true,
            message: 'Product prices updated',
            data: { updated: updatedCount, errors: errorCount }
        });
    }, 1000);
});
router.post('/reset-demo', auth_1.requireAdmin, (req, res) => {
    init_1.db.run('DELETE FROM products WHERE title IN (?)', [demoProducts.map(p => p.title).join(',')], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete old products' });
        }
        let insertedCount = 0;
        let errorCount = 0;
        demoProducts.forEach((product) => {
            init_1.db.run('INSERT INTO products (title, description, price, category, image_url, stock_quantity, external_id) VALUES (?, ?, ?, ?, ?, ?, ?)', [
                product.title,
                product.description,
                product.price,
                product.category,
                product.image_url,
                product.stock_quantity,
                `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            ], function (err) {
                if (err) {
                    errorCount++;
                }
                else {
                    insertedCount++;
                }
            });
        });
        setTimeout(() => {
            res.json({
                success: true,
                message: 'Demo products reset with new prices',
                data: { inserted: insertedCount, errors: errorCount }
            });
        }, 1000);
    });
});
router.get('/', async (req, res) => {
    const { page = 1, limit = 20, category, search, minPrice, maxPrice } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    try {
        let query = `
      SELECT * FROM products 
      WHERE 1=1
    `;
        const params = [];
        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        if (search) {
            query += ' AND (title LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        if (minPrice) {
            query += ' AND price >= ?';
            params.push(minPrice);
        }
        if (maxPrice) {
            query += ' AND price <= ?';
            params.push(maxPrice);
        }
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), offset);
        init_1.db.all(query, params, (err, products) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            init_1.db.get('SELECT COUNT(*) as total FROM products', (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json({
                    success: true,
                    data: {
                        products,
                        pagination: {
                            page: Number(page),
                            limit: Number(limit),
                            total: result.total,
                            pages: Math.ceil(result.total / Number(limit))
                        }
                    }
                });
            });
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
router.get('/:id', (req, res) => {
    const { id } = req.params;
    init_1.db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const demoProduct = demoProducts.find(p => p.title === product.title);
        if (demoProduct) {
            product.customization_options = demoProduct.customization_options;
        }
        res.json({ success: true, data: product });
    });
});
router.get('/:id/customization', (req, res) => {
    const { id } = req.params;
    init_1.db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const demoProduct = demoProducts.find(p => p.title === product.title);
        if (demoProduct) {
            res.json({ success: true, data: demoProduct.customization_options });
        }
        else {
            res.json({ success: true, data: null });
        }
    });
});
router.post('/', auth_1.authenticateToken, auth_1.requireAdminOrSeller, [
    (0, express_validator_1.body)('title').trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('price').isFloat({ min: 0 }),
    (0, express_validator_1.body)('category').trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('stock_quantity').optional().isInt({ min: 0 })
], (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { title, description, price, category, stock_quantity = 0, image_url } = req.body;
    const userId = req.user?.id;
    init_1.db.run('INSERT INTO products (title, description, price, category, stock_quantity, image_url, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)', [title, description, price, category, stock_quantity, image_url, userId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to create product' });
        }
        res.status(201).json({
            success: true,
            data: { id: this.lastID, title, description, price, category, stock_quantity, image_url }
        });
    });
});
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, [
    (0, express_validator_1.body)('title').optional().trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('price').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('category').optional().trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('stock_quantity').optional().isInt({ min: 0 })
], (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const updates = req.body;
    const fields = Object.keys(updates).filter(key => ['title', 'description', 'price', 'category', 'stock_quantity', 'image_url'].includes(key));
    if (fields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
    }
    const query = `
    UPDATE products 
    SET ${fields.map(field => `${field} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
    const values = [...fields.map(field => updates[field]), id];
    init_1.db.run(query, values, function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update product' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ success: true, message: 'Product updated successfully' });
    });
});
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, (req, res) => {
    const { id } = req.params;
    init_1.db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete product' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ success: true, message: 'Product deleted successfully' });
    });
});
router.post('/sync/external', auth_1.requireAdmin, async (req, res) => {
    try {
        const response = await axios_1.default.get('https://dummyjson.com/products?limit=100');
        const products = response.data.products;
        let syncedCount = 0;
        let errorCount = 0;
        for (const product of products) {
            try {
                init_1.db.get('SELECT id FROM products WHERE external_id = ?', [product.id.toString()], (err, existing) => {
                    if (err) {
                        errorCount++;
                        return;
                    }
                    if (!existing) {
                        init_1.db.run('INSERT INTO products (title, description, price, category, image_url, stock_quantity, external_id) VALUES (?, ?, ?, ?, ?, ?, ?)', [
                            product.title,
                            product.description,
                            product.price,
                            product.category,
                            product.images[0] || null,
                            product.stock,
                            product.id.toString()
                        ], (err) => {
                            if (err) {
                                errorCount++;
                            }
                            else {
                                syncedCount++;
                            }
                        });
                    }
                });
            }
            catch (error) {
                errorCount++;
            }
        }
        res.json({
            success: true,
            data: {
                synced: syncedCount,
                errors: errorCount,
                total: products.length
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to sync products' });
    }
});
exports.default = router;
//# sourceMappingURL=products.js.map