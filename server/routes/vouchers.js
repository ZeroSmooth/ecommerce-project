const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  /* =========================
     CREATE voucher
  ========================= */
  router.post("/", async (req, res) => {
    try {
      const { code, type, value } = req.body;

      if (!code || !type || value == null) {
        return res
          .status(400)
          .json({ error: "Code, type, and value are required" });
      }

      const result = await db.runAsync(
        "INSERT INTO vouchers (code, type, value, used) VALUES (?, ?, ?, 0)",
        [code, type, value],
      );

      res.json({ success: true, id: result.lastID });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /* =========================
     DELETE voucher
  ========================= */
  router.delete("/:id", async (req, res) => {
    try {
      const result = await db.runAsync("DELETE FROM vouchers WHERE id = ?", [
        req.params.id,
      ]);

      res.json({ success: true, changes: result.changes });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /* =========================
     EDIT voucher
  ========================= */
  router.patch("/:id", async (req, res) => {
    try {
      const { code, type, value, used } = req.body;
      const { id } = req.params;

      const usedInt = used === "Yes" || used === true ? 1 : 0;

      const result = await db.runAsync(
        `UPDATE vouchers 
         SET code = ?, type = ?, value = ?, used = ? 
         WHERE id = ?`,
        [code, type, value, usedInt, id],
      );

      if (result.changes === 0) {
        return res.status(404).json({ error: "Voucher not found" });
      }

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /* =========================
     CHECK voucher (FIXED)
  ========================= */
  router.get("/check/:code", async (req, res) => {
    try {
      const { code } = req.params;

      const voucher = await db.getAsync(
        "SELECT * FROM vouchers WHERE code = ?",
        [code],
      );

      if (!voucher) {
        return res.status(404).json({ error: "Voucher not found" });
      }

      if (voucher.used) {
        return res.status(400).json({ error: "Voucher already used" });
      }

      res.json({ success: true, voucher });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /* =========================
     MARK voucher as USED
  ========================= */
  router.patch("/use/:code", async (req, res) => {
    try {
      const { code } = req.params;

      const result = await db.runAsync(
        "UPDATE vouchers SET used = 1 WHERE code = ? AND used = 0",
        [code],
      );

      if (result.changes === 0) {
        return res
          .status(400)
          .json({ error: "Voucher not found or already used" });
      }

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /* =========================
     UNDO voucher
  ========================= */
  router.patch("/undo/:code", async (req, res) => {
    try {
      const { code } = req.params;

      const result = await db.runAsync(
        "UPDATE vouchers SET used = 0 WHERE code = ?",
        [code],
      );

      if (result.changes === 0) {
        return res.status(404).json({ error: "Voucher not found" });
      }

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  /* =========================
     GET vouchers
  ========================= */
  router.get("/", async (req, res) => {
    try {
      const rows = await db.allAsync(
        `SELECT id, code, type, value,
         CASE used WHEN 1 THEN 'Yes' ELSE 'No' END as used
         FROM vouchers
         ORDER BY id DESC`,
      );

      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
