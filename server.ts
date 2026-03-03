import express from 'express';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from './server/db';
import crypto from 'crypto';

const JWT_SECRET = 'saikat-super-secret-key-change-in-prod';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname)
    }
  });
  const upload = multer({ storage: storage });

  // Auth Middleware
  const requireAuth = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // --- API ROUTES ---

  // Auth
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    res.json({ user: { id: user.id, email: user.email, role: user.role } });
  });

  app.get('/api/auth/me', requireAuth, (req: any, res) => {
    res.json({ user: req.user });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  // Products
  app.get('/api/products', requireAuth, (req, res) => {
    const products = db.prepare('SELECT * FROM products ORDER BY name').all();
    res.json(products);
  });

  app.post('/api/products', requireAuth, upload.single('image'), (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { name, category, purchasePrice, wholesalePrice, retailPrice, stock, unit } = req.body;
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    const stmt = db.prepare('INSERT INTO products (name, category, purchasePrice, wholesalePrice, retailPrice, stock, unit, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const info = stmt.run(name, category, Number(purchasePrice), Number(wholesalePrice), Number(retailPrice), Number(stock), unit, imageUrl);
    res.json({ id: info.lastInsertRowid });
  });

  app.put('/api/products/:id', requireAuth, upload.single('image'), (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { name, category, purchasePrice, wholesalePrice, retailPrice, stock, unit } = req.body;
    const id = req.params.id;
    
    if (req.file) {
      const imageUrl = `/uploads/${req.file.filename}`;
      const stmt = db.prepare('UPDATE products SET name=?, category=?, purchasePrice=?, wholesalePrice=?, retailPrice=?, stock=?, unit=?, imageUrl=? WHERE id=?');
      stmt.run(name, category, Number(purchasePrice), Number(wholesalePrice), Number(retailPrice), Number(stock), unit, imageUrl, id);
    } else {
      const stmt = db.prepare('UPDATE products SET name=?, category=?, purchasePrice=?, wholesalePrice=?, retailPrice=?, stock=?, unit=? WHERE id=?');
      stmt.run(name, category, Number(purchasePrice), Number(wholesalePrice), Number(retailPrice), Number(stock), unit, id);
    }
    res.json({ success: true });
  });

  app.delete('/api/products/:id', requireAuth, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    db.prepare('DELETE FROM products WHERE id=?').run(req.params.id);
    res.json({ success: true });
  });

  // Sales
  app.post('/api/sales', requireAuth, (req, res) => {
    const { customerName, customerPhone, customerAddress, items, totalAmount, discount, finalAmount, paidAmount, dueAmount } = req.body;
    
    const runSale = db.transaction(() => {
      // 1. Customer
      let customer = db.prepare('SELECT * FROM customers WHERE phone = ?').get(customerPhone) as any;
      let customerId;
      if (customer) {
        customerId = customer.id;
        db.prepare('UPDATE customers SET totalDue = totalDue + ?, address = ? WHERE id = ?').run(dueAmount, customerAddress || customer.address, customerId);
      } else {
        const info = db.prepare('INSERT INTO customers (name, phone, address, totalDue) VALUES (?, ?, ?, ?)').run(customerName, customerPhone, customerAddress, dueAmount);
        customerId = info.lastInsertRowid;
      }

      // 2. Stock Check & Update
      for (const item of items) {
        const product = db.prepare('SELECT stock FROM products WHERE id = ?').get(item.id) as any;
        if (!product || product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ID ${item.id}`);
        }
        db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.id);
      }

      // 3. Create Sale
      const saleId = crypto.randomUUID();
      db.prepare('INSERT INTO sales (id, customerId, customerName, customerPhone, customerAddress, totalAmount, discount, finalAmount, paidAmount, dueAmount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(saleId, customerId, customerName, customerPhone, customerAddress, totalAmount, discount, finalAmount, paidAmount, dueAmount);

      // 4. Create Sale Items
      const insertItem = db.prepare('INSERT INTO sale_items (saleId, productId, name, quantity, salePrice, priceType, unit) VALUES (?, ?, ?, ?, ?, ?, ?)');
      for (const item of items) {
        insertItem.run(saleId, item.id, item.name, item.quantity, item.salePrice, item.priceType, item.unit);
      }

      return saleId;
    });

    try {
      const saleId = runSale();
      res.json({ success: true, saleId });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/sales', requireAuth, (req, res) => {
    const sales = db.prepare('SELECT * FROM sales ORDER BY createdAt DESC').all() as any[];
    const salesWithItems = sales.map(sale => {
      const items = db.prepare('SELECT * FROM sale_items WHERE saleId = ?').all(sale.id);
      return { ...sale, items };
    });
    res.json(salesWithItems);
  });

  // Customers (Due Book)
  app.get('/api/customers', requireAuth, (req, res) => {
    const customers = db.prepare('SELECT * FROM customers WHERE totalDue > 0 ORDER BY name').all();
    res.json(customers);
  });

  app.post('/api/customers/:id/pay', requireAuth, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { amount } = req.body;
    db.prepare('UPDATE customers SET totalDue = MAX(0, totalDue - ?) WHERE id = ?').run(amount, req.params.id);
    res.json({ success: true });
  });

  // Dashboard Stats
  app.get('/api/dashboard', requireAuth, (req, res) => {
    const totalSales = (db.prepare('SELECT SUM(finalAmount) as total FROM sales').get() as any).total || 0;
    const totalDue = (db.prepare('SELECT SUM(totalDue) as total FROM customers').get() as any).total || 0;
    const totalProducts = (db.prepare('SELECT COUNT(*) as count FROM products').get() as any).count || 0;
    const lowStockItems = db.prepare('SELECT * FROM products WHERE stock < 10').all();
    
    res.json({
      totalSales,
      totalDue,
      totalProducts,
      lowStockItems
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(\`Server running on http://localhost:\${PORT}\`);
  });
}

startServer();
