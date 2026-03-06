import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'database.sqlite'));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    purchasePrice REAL,
    wholesalePrice REAL,
    retailPrice REAL,
    stock INTEGER,
    unit TEXT,
    imageUrl TEXT
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    address TEXT,
    totalDue REAL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    customerId INTEGER,
    customerName TEXT,
    customerPhone TEXT,
    customerAddress TEXT,
    totalAmount REAL,
    discount REAL,
    finalAmount REAL,
    paidAmount REAL,
    dueAmount REAL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    saleId TEXT,
    productId INTEGER,
    name TEXT,
    quantity INTEGER,
    salePrice REAL,
    priceType TEXT,
    unit TEXT
  );
`);

// Seed admin user
const adminEmail = 'admin@saikat.com';
const adminCheck = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
if (!adminCheck) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)').run(adminEmail, hash, 'admin');
}

// Seed normal user
const userEmail = 'user@saikat.com';
const userCheck = db.prepare('SELECT * FROM users WHERE email = ?').get(userEmail);
if (!userCheck) {
  const hash = bcrypt.hashSync('user123', 10);
  db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)').run(userEmail, hash, 'user');
}

export default db;
