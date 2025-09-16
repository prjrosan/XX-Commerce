import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { db } from "../database/init";
import { requireAdmin, requireAdminOrSeller, authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// Get all products
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category, search, sort = "created_at", order = "desc", page = 1, limit = 20 } = req.query;
    
    let query = "SELECT * FROM products WHERE 1=1";
    const params: any[] = [];
    
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
    const countParams: any[] = [];
    
    if (category && category !== "all") {
      countQuery += " AND category = ?";
      countParams.push(category);
    }
    
    if (search) {
      countQuery += " AND (name LIKE ? OR description LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    const [countResult] = await db!.execute(countQuery, countParams);
    const total = (countResult as any)[0].total;
    
    const [products] = await db!.execute(query, params);
    
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
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single product
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [products] = await db!.execute("SELECT * FROM products WHERE id = ?", [id]);
    
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json({
      success: true,
      data: products[0]
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create product (Admin/Seller only)
router.post("/", authenticateToken, requireAdminOrSeller, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, category, image, stock } = req.body;
    const userId = req.user?.id;

    const query = `INSERT INTO products (name, description, price, category, image, stock, seller_id) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    const [result] = await db!.execute(query, [name, description, price, category, image, stock, userId]);
    const productId = (result as any).insertId;

    res.status(201).json({
      success: true,
      data: { id: productId, name, description, price, category, image, stock, seller_id: userId }
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update product (Admin/Seller only)
router.put("/:id", authenticateToken, requireAdminOrSeller, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image, stock } = req.body;
    const userId = req.user?.id;

    // Check if product exists and user has permission
    const [products] = await db!.execute("SELECT seller_id FROM products WHERE id = ?", [id]);
    
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = products[0] as any;
    if (req.user?.role !== "admin" && product.seller_id !== userId) {
      return res.status(403).json({ error: "Not authorized to update this product" });
    }

    const query = `UPDATE products SET name = ?, description = ?, price = ?, 
                   category = ?, image = ?, stock = ? WHERE id = ?`;
    
    await db!.execute(query, [name, description, price, category, image, stock, id]);

    res.json({
      success: true,
      data: { id, name, description, price, category, image, stock }
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete product (Admin/Seller only)
router.delete("/:id", authenticateToken, requireAdminOrSeller, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check if product exists and user has permission
    const [products] = await db!.execute("SELECT seller_id FROM products WHERE id = ?", [id]);
    
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = products[0] as any;
    if (req.user?.role !== "admin" && product.seller_id !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this product" });
    }

    await db!.execute("DELETE FROM products WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
