const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  /* =========================
     GET ALL RECEIPTS
  ========================= */
  router.get("/", async (req, res) => {
    try {
      const rows = await db.allAsync("SELECT * FROM receipts ORDER BY id DESC");

      const formatted = rows.map((r) => ({
        ...r,
        items: r.items ? JSON.parse(r.items) : [],
      }));

      res.json(formatted);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /* =========================
     CREATE RECEIPT (ORDER)
  ========================= */
  router.post("/", async (req, res) => {
    try {
      const { user, items, address, voucher, total, date } = req.body;

      if (!user) {
        return res.status(400).json({ error: "User missing" });
      }

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: "Items must be array" });
      }

      const result = await db.runAsync(
        `INSERT INTO receipts (user, items, address, voucher, total, date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          user,
          JSON.stringify(items),
          address || "",
          voucher || "",
          total || 0,
          date || new Date().toISOString(),
        ],
      );

      res.json({
        success: true,
        id: result.lastID,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
