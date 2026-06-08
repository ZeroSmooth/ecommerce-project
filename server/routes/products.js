const jwt = require("jsonwebtoken");

module.exports = (app, db, upload) => {
  const SECRET_KEY = "supersecretkey";

  // =========================
  // ADMIN AUTH CHECK (COOKIE JWT)
  // =========================
  const requireAdmin = (req) => {
    const token = req.cookies?.auth_token;

    if (!token) {
      throw new Error("Not authenticated");
    }

    let decoded;

    try {
      decoded = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      throw new Error("Invalid token");
    }

    if (decoded.role !== "admin") {
      throw new Error("Access denied");
    }

    return decoded;
  };

  // =========================
  // GET ALL PRODUCTS
  // =========================
  app.get("/products", async (req, res) => {
    try {
      const rows = await db.allAsync("SELECT * FROM products");
      res.json(rows);
    } catch (err) {
      res.status(500).json(err);
    }
  });

  // =========================
  // GET SINGLE PRODUCT
  // =========================
  app.get("/products/:id", async (req, res) => {
    try {
      const row = await db.getAsync("SELECT * FROM products WHERE id=?", [
        req.params.id,
      ]);

      res.json(row);
    } catch (err) {
      res.status(500).json(err);
    }
  });

  // =========================
  // ADD PRODUCT (ADMIN ONLY)
  // =========================
  app.post("/add-product", upload.single("image"), async (req, res) => {
    try {
      requireAdmin(req); // ⭐ SECURITY FIX

      const { name, price, stock, category, rating, brand, description } =
        req.body;

      const image = req.file ? req.file.filename : null;

      const result = await db.runAsync(
        `INSERT INTO products
         (name, price, stock, category, rating, brand, image, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          price,
          stock,
          category,
          rating || 0,
          brand || "",
          image,
          description || "",
        ],
      );

      res.json({
        message: "Product added",
        productId: result.lastID,
      });
    } catch (err) {
      res.status(401).json({ message: err.message });
    }
  });

  // =========================
  // UPDATE PRODUCT (ADMIN ONLY)
  // =========================
  app.put("/products/:id", upload.single("image"), async (req, res) => {
    try {
      requireAdmin(req);

      // support BOTH JSON and form-data
      const data = req.body;

      const fields = [];
      const params = [];

      if (data.name !== undefined) {
        fields.push("name=?");
        params.push(data.name);
      }

      if (data.price !== undefined) {
        fields.push("price=?");
        params.push(data.price);
      }

      if (data.stock !== undefined) {
        fields.push("stock=?");
        params.push(data.stock);
      }

      if (data.category !== undefined) {
        fields.push("category=?");
        params.push(data.category);
      }

      if (data.brand !== undefined) {
        fields.push("brand=?");
        params.push(data.brand);
      }

      if (data.description !== undefined) {
        fields.push("description=?");
        params.push(data.description);
      }

      // ONLY update image if file exists
      if (req.file) {
        fields.push("image=?");
        params.push(req.file.filename);
      }

      if (!fields.length) {
        return res.status(400).json({ message: "No fields to update" });
      }

      params.push(req.params.id);

      await db.runAsync(
        `UPDATE products SET ${fields.join(", ")} WHERE id=?`,
        params,
      );

      res.json({ message: "Product updated" });
    } catch (err) {
      res.status(401).json({ message: err.message });
    }
  });

  // =========================
  // DELETE PRODUCT (ADMIN ONLY)
  // =========================
  app.delete("/products/:id", async (req, res) => {
    try {
      requireAdmin(req); // ⭐ SECURITY FIX

      await db.runAsync("DELETE FROM products WHERE id=?", [req.params.id]);

      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(401).json({ message: err.message });
    }
  });

  // =========================
  // REDUCE STOCK (PUBLIC SAFE)
  // =========================
  app.patch("/products/:id/reduce-stock", async (req, res) => {
    try {
      const { qty } = req.body;
      const productId = req.params.id;

      const row = await db.getAsync("SELECT stock FROM products WHERE id=?", [
        productId,
      ]);

      if (!row) {
        return res.status(404).json({ message: "Not found" });
      }

      const quantity = Number(qty);

      if (!quantity || quantity <= 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      if (row.stock < quantity) {
        return res.status(400).json({ message: "Not enough stock" });
      }

      const newStock = row.stock - quantity;

      await db.runAsync("UPDATE products SET stock=? WHERE id=?", [
        newStock,
        productId,
      ]);

      res.json({
        message: "Stock updated",
        stock: newStock,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
};
