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

      res.json({ success: true, token });
    } catch (err) {
      res.json({ success: false, message: err.message });
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

      res.json({ success: true, user });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  });

  /* =========================
      GET USER
  ========================= */
  app.get("/me", async (req, res) => {
    try {
      const token = req.cookies?.auth_token;
      if (!token) return res.json({ loggedIn: false });

      const decoded = jwt.verify(token, SECRET_KEY);

      const user = await db.getAsync(
        `
        SELECT id, username, email, role, token, token_expiry
        FROM users
        WHERE id=?
        `,
        [decoded.id],
      );

      if (!user || user.token !== token) {
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

    res.clearCookie("auth_token");
    res.clearCookie("auth_expiry");

    res.json({ success: true });
  });

  /* =========================
      CHECK EMAIL
  ========================= */
  app.post("/forgot-password/check", async (req, res) => {
    try {
      const { email } = req.body;

      const user = await db.getAsync(
        `SELECT id FROM users WHERE LOWER(email)=LOWER(?)`,
        [email.trim()],
      );

      if (!user) {
        return res.json({ success: false, message: "No account found" });
      }

      return res.json({ success: true });
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }
  });

  /* =========================
      SEND 4-DIGIT CODE (NEW)
  ========================= */
  app.post("/forgot-password/send-code", async (req, res) => {
    try {
      const { email } = req.body;

      const user = await db.getAsync(
        `SELECT * FROM users WHERE LOWER(email)=LOWER(?)`,
        [email.trim()],
      );

      if (!user) {
        return res.json({ success: false, message: "Email not found" });
      }

      // 4-digit PIN
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      await db.runAsync(
        `UPDATE users SET reset_code=?, reset_expiry=? WHERE id=?`,
        [code, expiry, user.id],
      );

      const html = `
        <div style="font-family:Arial;padding:20px">
          <h2>Password Reset Code</h2>
          <p>Your 4-digit code:</p>
          <h1 style="letter-spacing:8px">${code}</h1>
          <p>Expires in 10 minutes</p>
        </div>
      `;

      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: {
            name: "ecommerce",
            email: "zerosmoothgtz@gmail.com",
          },
          to: [{ email }],
          subject: "Your Password Reset Code",
          htmlContent: html,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(JSON.stringify(data));

      return res.json({ success: true });
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }
  });

  /* =========================
      VERIFY CODE (NEW)
  ========================= */
  app.post("/forgot-password/verify-code", async (req, res) => {
    try {
      const { email, code } = req.body;

      const user = await db.getAsync(
        `SELECT * FROM users WHERE LOWER(email)=LOWER(?)`,
        [email.trim()],
      );

      if (!user) {
        return res.json({ success: false, message: "User not found" });
      }

      if (user.reset_code !== code) {
        return res.json({ success: false, message: "Invalid code" });
      }

      if (new Date(user.reset_expiry) < new Date()) {
        return res.json({ success: false, message: "Code expired" });
      }

      return res.json({ success: true });
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }
  });

  /* =========================
      RESET PASSWORD (UNCHANGED)
  ========================= */
  app.post("/forgot-password/reset", async (req, res) => {
    try {
      const { email, newPassword } = req.body;

      const user = await db.getAsync(
        `SELECT id FROM users WHERE LOWER(email)=LOWER(?)`,
        [email.trim()],
      );

      if (!user) {
        return res.json({ success: false, message: "No account found" });
      }

      await db.runAsync(
        `UPDATE users SET password=?, token=NULL, token_expiry=NULL WHERE id=?`,
        [newPassword, user.id],
      );

      return res.json({ success: true });
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }
  });
};
