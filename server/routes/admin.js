const jwt = require("jsonwebtoken");
const SECRET_KEY = "supersecretkey";

module.exports = (app, db) => {
  /* =========================
     AUTH MIDDLEWARE (ADMIN)
  ========================= */
  const requireAdmin = async (req) => {
    const token = req.cookies?.auth_token;

    if (!token) {
      throw new Error("Not authenticated");
    }

    let decoded;

    try {
      decoded = jwt.verify(token, SECRET_KEY);
    } catch {
      throw new Error("Invalid token");
    }

    const user = await db.getAsync(
      `
    SELECT
      id,
      role,
      token,
      token_expiry
    FROM users
    WHERE id=?
    `,
      [decoded.id],
    );

    if (!user) {
      throw new Error("User not found");
    }

    if (user.token !== token) {
      throw new Error("Token mismatch");
    }

    if (user.role !== "admin") {
      throw new Error("Access denied");
    }

    if (user.token_expiry && new Date(user.token_expiry) < new Date()) {
      throw new Error("Token expired");
    }

    return user;
  };

  /* =========================
     GET USERS (ADMIN)
  ========================= */
  app.get("/admin/users", async (req, res) => {
    try {
      await requireAdmin(req);

      const users = await db.allAsync(
        "SELECT id, username, email, role FROM users",
      );

      res.json(users);
    } catch (err) {
      res.status(401).json({ message: err.message });
    }
  });

  /* =========================
     DELETE USER (ADMIN)
  ========================= */
  app.delete("/admin/users/:id", async (req, res) => {
    try {
      await requireAdmin(req);

      const result = await db.runAsync("DELETE FROM users WHERE id=?", [
        req.params.id,
      ]);

      res.json({
        message: "User deleted",
        changes: result.changes,
      });
    } catch (err) {
      res.status(401).json({ message: err.message });
    }
  });

  /* =========================
     UPDATE USER (ADMIN)
  ========================= */
  app.put("/admin/users/:id", async (req, res) => {
    try {
      await requireAdmin(req);

      const { username, email, role } = req.body;

      await db.runAsync(
        `UPDATE users SET username=?, email=?, role=? WHERE id=?`,
        [username, email, role, req.params.id],
      );

      res.json({ message: "User updated" });
    } catch (err) {
      res.status(401).json({ message: err.message });
    }
  });
};
