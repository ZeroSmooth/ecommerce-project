const jwt = require("jsonwebtoken");
const SECRET_KEY = "supersecretkey";

module.exports = (app, db) => {
  /* =========================
      REGISTER
    ========================= */
  app.post("/register", async (req, res) => {
    try {
      const { username, email, password, rememberMe } = req.body;

      const result = await db.runAsync(
        `
        INSERT INTO users (username, email, password)
        VALUES (?, ?, ?)
        `,
        [username, email, password],
      );

      const token = jwt.sign({ id: result.lastID, role: "user" }, SECRET_KEY);

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (rememberMe ? 30 : 1));

      await db.runAsync(
        `
        UPDATE users
        SET token=?, token_expiry=?
        WHERE id=?
        `,
        [token, expiryDate.toISOString(), result.lastID],
      );

      res.cookie("auth_token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        expires: expiryDate,
      });

      res.cookie("auth_expiry", expiryDate.toISOString(), {
        httpOnly: false,
        sameSite: "none",
        secure: true,
        expires: expiryDate,
      });

      res.json({
        success: true,
        token,
      });
    } catch (err) {
      res.json({
        success: false,
        message: err.message,
      });
    }
  });

  /* =========================
      LOGIN
    ========================= */
  app.post("/login", async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;

      const user = await db.getAsync(
        `SELECT * FROM users WHERE email=? AND password=?`,
        [email, password],
      );

      if (!user) {
        return res.json({
          success: false,
          message: "Invalid login",
        });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY);

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (rememberMe ? 30 : 1));

      await db.runAsync(
        `
        UPDATE users
        SET token=?, token_expiry=?
        WHERE id=?
        `,
        [token, expiryDate.toISOString(), user.id],
      );

      res.cookie("auth_token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        expires: expiryDate,
      });

      res.cookie("auth_expiry", expiryDate.toISOString(), {
        httpOnly: false,
        sameSite: "none",
        secure: true,
        expires: expiryDate,
      });

      res.json({
        success: true,
        user,
      });
    } catch (err) {
      res.json({
        success: false,
        message: err.message,
      });
    }
  });

  /* =========================
      GET CURRENT USER (/me)
    ========================= */
  app.get("/me", async (req, res) => {
    try {
      const token = req.cookies?.auth_token;

      if (!token) {
        return res.json({ loggedIn: false });
      }

      const decoded = jwt.verify(token, SECRET_KEY);

      const user = await db.getAsync(
        `
        SELECT id, username, email, role, token, token_expiry
        FROM users
        WHERE id=?
        `,
        [decoded.id],
      );

      if (!user) {
        return res.json({ loggedIn: false });
      }

      if (user.token !== token) {
        return res.json({ loggedIn: false });
      }

      if (user.token_expiry && new Date(user.token_expiry) < new Date()) {
        return res.json({ loggedIn: false });
      }

      return res.json({
        loggedIn: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch {
      return res.json({ loggedIn: false });
    }
  });

  /* =========================
      LOGOUT
    ========================= */
  app.post("/logout", async (req, res) => {
    try {
      const token = req.cookies?.auth_token;

      if (token) {
        const decoded = jwt.verify(token, SECRET_KEY);

        await db.runAsync(
          `
        UPDATE users
        SET token=NULL, token_expiry=NULL
        WHERE id=?
        `,
          [decoded.id],
        );
      }
    } catch {}

    res.clearCookie("auth_token", { sameSite: "none", secure: true });
    res.clearCookie("auth_expiry", { sameSite: "none", secure: true });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  });
  /* =========================
  FORGOT PASSWORD - CHECK EMAIL
========================= */
  app.post("/forgot-password/check", async (req, res) => {
    try {
      const { email } = req.body;

      const user = await db.getAsync(
        `SELECT id FROM users WHERE LOWER(email) = LOWER(?)`,
        [email.trim()],
      );

      if (!user) {
        return res.json({
          success: false,
          message: "No account found with that email",
        });
      }

      return res.json({ success: true });
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }
  });

  /* =========================
  FORGOT PASSWORD - RESET
========================= */
  app.post("/forgot-password/reset", async (req, res) => {
    try {
      const { email, newPassword } = req.body;

      const user = await db.getAsync(
        `SELECT id FROM users WHERE LOWER(email) = LOWER(?)`,
        [email.trim()],
      );

      if (!user) {
        return res.json({
          success: false,
          message: "No account found with that email",
        });
      }

      await db.runAsync(
        `UPDATE users SET password = ?, token = NULL, token_expiry = NULL WHERE id = ?`,
        [newPassword, user.id],
      );

      return res.json({ success: true });
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }
  });
};
