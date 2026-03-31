require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');
const supabase = require('./db');
const path = require('path');
const fs = require('fs');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL, // Set this on Railway to your Vercel URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supermart_secret_super_secure';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'SuperAdmin123!';

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
  try {
    let pk = process.env.FIREBASE_PRIVATE_KEY;
    if (pk.startsWith('"') && pk.endsWith('"')) pk = pk.slice(1, -1);
    if (pk.startsWith("'") && pk.endsWith("'")) pk = pk.slice(1, -1);

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: pk.replace(/\\n/g, '\n'),
      })
    });
    console.log('Firebase Admin SDK initialized from environment variables.');
  } catch (err) {
    console.error('🔥 Firebase Init Error (Check your PRIVATE_KEY spelling):', err.message);
  }
} else if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  console.log('Firebase Admin SDK initialized from local file.');
} else {
  console.warn('⚠️  Neither environment variables nor serviceAccountKey.json found. Firebase auth will fail.');
}

// --- MIDDLEWARE ---
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access Denied: No Token Provided' });
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    if (verified.role !== 'admin') return res.status(403).json({ error: 'Access Denied: Not an Admin' });
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid Token' });
  }
};

// --- API ROUTES ---

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Supabase + Firebase Backend running!' });
});

// Root check
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SuperMart API! The backend is running perfectly.' });
});

// 2. Fetch all products
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (error) throw error;
    const products = data.map(r => ({
      ...r,
      inStock: r.in_stock,
      isFresh: r.is_fresh,
      tags: Array.isArray(r.tags) ? r.tags : JSON.parse(r.tags || '[]')
    }));
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// 3. Firebase Auth — Exchange Firebase ID token for App JWT
app.post('/api/auth/firebase', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'Missing Firebase ID token' });

  try {
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, phone_number, email, name: displayName, picture } = decodedToken;

    const phone = phone_number || email || uid;
    const name = displayName || email?.split('@')[0] || 'User';
    const avatar = picture || null;

    // Upsert user in Supabase
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', uid)
      .single();

    let userId;
    if (existing) {
      userId = existing.id;
      // Update latest info
      await supabase.from('users').update({ name, phone, avatar }).eq('id', userId);
    } else {
      userId = `u_${Date.now()}`;
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ id: userId, firebase_uid: uid, name, phone, avatar, password: '' }]);
      if (insertError) throw insertError;
    }

    const token = jwt.sign({ id: userId, name, phone }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: userId, name, phone, avatar }, token });

  } catch (err) {
    console.error('Firebase auth error:', err.message);
    res.status(401).json({ error: 'Invalid Firebase token: ' + err.message });
  }
});

// 4. Legacy register (keep for fallback)
app.post('/api/auth/register', async (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password) return res.status(400).json({ error: 'Missing fields' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = `u_${Date.now()}`;

  const { error } = await supabase.from('users').insert([{ id: userId, name, phone, password: hashedPassword, firebase_uid: userId }]);
  if (error) {
    if (error.message.includes('unique')) return res.status(400).json({ error: 'Phone already registered' });
    return res.status(500).json({ error: 'Database error' });
  }

  const token = jwt.sign({ id: userId, name, phone }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ user: { id: userId, name, phone }, token });
});

// 5. Legacy login (keep for fallback)
app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  const { data: user } = await supabase.from('users').select('*').eq('phone', phone).single();

  if (!user) return res.status(400).json({ error: 'Invalid phone or password' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid phone or password' });

  const token = jwt.sign({ id: user.id, name: user.name, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ user: { id: user.id, name: user.name, phone: user.phone }, token });
});

// Admin password helper — reads from Supabase settings, falls back to .env
async function getAdminPassword() {
  const { data } = await supabase.from('admin_settings').select('value').eq('key', 'admin_password').single();
  return data?.value || ADMIN_PASSWORD;
}

// 4.5. Admin Login
app.post('/api/auth/admin-login', async (req, res) => {
  const { password } = req.body;
  const currentPassword = await getAdminPassword();
  if (password === currentPassword) {
    const token = jwt.sign({ id: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, user: { id: 'admin', role: 'admin' } });
  }
  res.status(400).json({ error: 'Invalid Admin Password' });
});

// 4.6. Change Admin Password
app.post('/api/auth/admin-change-password', verifyAdmin, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });

  const storedPassword = await getAdminPassword();
  if (currentPassword !== storedPassword) return res.status(401).json({ error: 'Current password is incorrect' });

  // Upsert into admin_settings table
  const { error } = await supabase.from('admin_settings').upsert({ key: 'admin_password', value: newPassword });
  if (error) return res.status(500).json({ error: 'Failed to update password' });

  res.json({ message: 'Password updated successfully' });
});

// 5. Place an order
app.post('/api/orders', async (req, res) => {
  const { userId, total, address, items, paymentMethod } = req.body;
  const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

  const { error } = await supabase.from('orders').insert([{
    id: orderId,
    user_id: userId,
    total_amount: total,
    delivery_address: JSON.stringify(address),
    payment_method: paymentMethod || 'COD',
    status: 'Processing'
  }]);

  if (error) return res.status(500).json({ error: 'Failed to create order' });

  // Insert order items
  if (items && items.length > 0) {
    const itemRows = items.map(item => ({
      id: `oi_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      order_id: orderId,
      product_id: item.id,
      quantity: item.quantity,
      price_at_time: item.price
    }));
    await supabase.from('order_items').insert(itemRows);
  }

  res.json({ message: 'Order placed successfully', orderId });
});

// 5.5. Fetch user orders
app.get('/api/orders/user/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id, total_amount, status, created_at, delivery_address, payment_method,
        order_items ( product_id, quantity, price_at_time, products ( name, image ) )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = orders.map(o => ({
      id: o.id,
      total: o.total_amount,
      status: o.status,
      date: o.created_at,
      delivery_address: o.delivery_address,
      payment_method: o.payment_method,
      items: (o.order_items || []).map(oi => ({
        id: oi.product_id,
        name: oi.products?.name,
        image: oi.products?.image,
        quantity: oi.quantity,
        price: oi.price_at_time
      }))
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// --- ADMIN ROUTES ---

// 6. Fetch all orders (Admin) — with full order items
app.get('/api/admin/orders', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        users(phone, name),
        order_items(
          product_id, quantity, price_at_time,
          products(name, image, unit)
        )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const formatted = data.map(o => ({
      ...o,
      customer_phone: o.users?.phone,
      customer_name: o.users?.name,
      items: (o.order_items || []).map(oi => ({
        id: oi.product_id,
        name: oi.products?.name || 'Unknown Item',
        image: oi.products?.image || '📦',
        unit: oi.products?.unit || '',
        quantity: oi.quantity,
        price: oi.price_at_time
      }))
    }));
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// 7. Update order status (Admin)
app.patch('/api/admin/orders/:id', verifyAdmin, async (req, res) => {
  const { status } = req.body;
  const { error } = await supabase.from('orders').update({ status }).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: 'Failed to update order' });
  res.json({ message: 'Order updated' });
});

// 8. Update product stock (Admin)
app.patch('/api/admin/products/:id', verifyAdmin, async (req, res) => {
  const { in_stock } = req.body;
  const { error } = await supabase.from('products').update({ in_stock }).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: 'Failed to update product' });
  res.json({ message: 'Product updated' });
});

// 9. Create a new Product (Admin)
app.post('/api/admin/products', verifyAdmin, async (req, res) => {
  const { name, category, price, mrp, image, unit, in_stock, is_fresh } = req.body;
  if (!name || !price || !category) return res.status(400).json({ error: 'Missing core product details' });

  const id = `p_${Date.now()}`;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const tags = [category];

  const { error } = await supabase.from('products').insert([{
    id, name, category, price, mrp,
    image: image || '📦', unit: unit || '1 pc',
    in_stock: in_stock !== false,
    stock_level: 'high',
    is_fresh: is_fresh || false,
    tags,
    discount
  }]);

  if (error) return res.status(500).json({ error: 'Failed to create product' });
  res.json({ message: 'Product created successfully', productId: id });
});

// 10. Upload product image to Supabase Storage and return URL (Admin)
app.post('/api/admin/upload-image', verifyAdmin, async (req, res) => {
  // Image should be sent as base64 in body
  const { base64, fileName, mimeType } = req.body;
  if (!base64) return res.status(400).json({ error: 'No image data provided' });

  try {
    const buffer = Buffer.from(base64, 'base64');
    const filePath = `products/${Date.now()}_${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, buffer, { contentType: mimeType });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
    res.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

const PORT = process.env.PORT || 5000;

// Auto-run if not deployed on Vercel's serverless platform
if (process.env.NODE_ENV !== 'production' || process.env.RAILWAY_ENVIRONMENT || process.env.RENDER || require.main === module) {
  app.listen(PORT, () => {
    console.log(`SuperMart API running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
