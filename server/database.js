const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.sqlite", (err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

/* USERS TABLE */
db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'user',
  token TEXT,
  token_expiry DATETIME
)
`);

/* PRODUCTS TABLE */
db.run(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  price REAL,
  stock INTEGER,
  category TEXT,
  rating REAL,
  image TEXT
)
`);

/* RECEIPTS TABLE */
db.run(`
CREATE TABLE IF NOT EXISTS receipts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user TEXT,
  items TEXT,
  address TEXT,
  voucher TEXT,
  total REAL,
  date TEXT
)
`);

/* VOUCHERS TABLE */
db.run(`
  CREATE TABLE IF NOT EXISTS vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    type TEXT,
    value REAL,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
