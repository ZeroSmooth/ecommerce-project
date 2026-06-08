const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const cookieParser = require("cookie-parser");

const db = require("./dbAsync");

/* ROUTES */
const receiptsRoutes = require("./routes/receipts");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const usersRouter = require("./routes/users");
const productRoutes = require("./routes/products");
const voucherRoutes = require("./routes/vouchers");

const app = express();
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10000); // 10s

const res = await fetch(
  "https://ecommerce-project-zpx8.onrender.com/products",
  { signal: controller.signal },
);
clearTimeout(timeout);
/* =========================
   CORS (FIXED)
========================= */
const allowedOrigins = [
  "http://localhost:3000",
  "https://ecommerce-project-two-indol.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, origin); // ✅ echo back the actual origin
      }
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: false,
  }),
);

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static("uploads"));

/* =========================
   FILE UPLOAD
========================= */
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* =========================
   ROUTES
========================= */
app.use("/admin/receipts", receiptsRoutes(db));
app.use("/admin/users", usersRouter);
app.use("/admin/vouchers", voucherRoutes(db));

authRoutes(app, db);
adminRoutes(app, db);
productRoutes(app, db, upload);

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("Server working");
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
