const express = require("express");
const router = express.Router();
const db = require("../dbAsync");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "supersecretkey";

/* =========================
   AUTH CHECK (ADMIN)
========================= */
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

/* =========================
   GET ALL USERS (ADMIN ONLY)
========================= */
router.get("/", async (req, res) => {
  try {
    requireAdmin(req);

    const rows = await db.allAsync(
      "SELECT id, username, email, role FROM users",
    );

    res.json(rows);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

/* =========================
   DELETE USER (ADMIN ONLY)
========================= */
router.delete("/:id", async (req, res) => {
  try {
    requireAdmin(req);

    const result = await db.runAsync("DELETE FROM users WHERE id=?", [
      req.params.id,
    ]);

    res.json({
      message: "User deleted",
      changes: result.changes,
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

/* =========================
   UPDATE USER (ADMIN ONLY)
========================= */
router.put("/:id", async (req, res) => {
  try {
    requireAdmin(req);

    const { username, email, role } = req.body;

    const result = await db.runAsync(
      `UPDATE users SET username=?, email=?, role=? WHERE id=?`,
      [username, email, role, req.params.id],
    );

    res.json({
      message: "User updated",
      changes: result.changes,
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

module.exports = router;
