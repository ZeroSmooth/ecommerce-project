require("dotenv").config();
console.log("EMAIL_USER:", process.env.EMAIL_USER); // ← add this
console.log("EMAIL_PASS:", process.env.EMAIL_PASS); // ← add this

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const cookieParser = require("cookie-parser");

const db = require("./dbAsync");

const receiptsRoutes = require("./routes/receipts");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const usersRouter = require("./routes/users");
const productRoutes = require("./routes/products");
const voucherRoutes = require("./routes/vouchers");
const emailRoutes = require("./routes/email");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://ecommerce-project-two-indol.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, origin);
      }
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  }),
);

// ✅ Middleware FIRST before any routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ✅ Routes AFTER middleware
app.use("/admin/receipts", receiptsRoutes(db));
app.use("/admin/users", usersRouter);
app.use("/admin/vouchers", voucherRoutes(db));

authRoutes(app, db);
adminRoutes(app, db);
productRoutes(app, db, upload);
emailRoutes(app); // ✅ moved here

app.get("/", (req, res) => {
  res.send("Server working");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
