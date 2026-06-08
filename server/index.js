const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const cookieParser = require("cookie-parser");

const db = require("./dbAsync"); // ✅ USE THIS

/* ROUTES */
const receiptsRoutes = require("./routes/receipts");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const usersRouter = require("./routes/users");
const productRoutes = require("./routes/products");
const voucherRoutes = require("./routes/vouchers");

const app = express();

/* =========================
   CORS (COOKIE SUPPORT)
========================= */
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // REQUIRED for cookies
  }),
);

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // ENABLE COOKIE PARSING

app.use("/uploads", express.static("uploads"));

/* =========================
   FILE UPLOAD (MULTER)
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
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
