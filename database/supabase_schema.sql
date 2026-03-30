-- Run this entire SQL in your Supabase project's SQL Editor
-- Go to: https://supabase.com/dashboard → Your Project → SQL Editor → New Query

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  mrp REAL NOT NULL DEFAULT 0,
  image TEXT DEFAULT '📦',
  unit TEXT DEFAULT '1 pc',
  in_stock BOOLEAN DEFAULT TRUE,
  stock_level TEXT DEFAULT 'high',
  is_fresh BOOLEAN DEFAULT FALSE,
  tags JSONB DEFAULT '[]',
  discount INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users Table (firebase_uid links to Firebase)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  password TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  total_amount REAL NOT NULL,
  status TEXT DEFAULT 'Processing',
  payment_method TEXT DEFAULT 'COD',
  delivery_address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_time REAL NOT NULL
);

-- 5. Seed Products
INSERT INTO products (id, name, category, price, mrp, image, unit, in_stock, stock_level, is_fresh, tags, discount) VALUES
('p1', 'Farm Fresh Tomatoes', 'veg-fruits', 45, 60, '🍅', '1 kg', TRUE, 'high', TRUE, '["fresh","popular"]', 25),
('p2', 'Amul Taaza Toned Milk', 'dairy', 52, 54, '🥛', '1 L', TRUE, 'high', TRUE, '["dairy","popular"]', 3),
('p3', 'Britannia Whole Wheat Bread', 'bakery', 45, 50, '🍞', '400 g', TRUE, 'low', TRUE, '["bakery","popular"]', 10),
('p4', 'Surf Excel Easy Wash', 'cleaning', 110, 130, '✨', '1 kg', TRUE, 'high', FALSE, '["cleaning"]', 15),
('p5', 'Coca-Cola Zero Sugar', 'beverages', 40, 40, '🥤', '300 ml', TRUE, 'high', FALSE, '["beverages"]', 0),
('p6', 'Lays Magic Masala', 'snacks', 20, 20, '🥔', '50 g', TRUE, 'high', FALSE, '["snacks","popular"]', 0),
('p7', 'India Gate Basmati Rice', 'staples', 199, 250, '🍚', '1 kg', TRUE, 'high', FALSE, '["staples"]', 20),
('p8', 'McCain French Fries', 'frozen', 125, 150, '🍟', '400 g', TRUE, 'low', FALSE, '["frozen"]', 16),
('p9', 'Fresh Spinach (Palak)', 'veg-fruits', 25, 35, '🥬', '250 g', TRUE, 'high', TRUE, '["fresh","popular"]', 28),
('p10', 'Amul Butter', 'dairy', 56, 58, '🧈', '100 g', TRUE, 'high', FALSE, '["dairy"]', 0),
('p11', 'Eggs (Pack of 6)', 'dairy', 45, 50, '🥚', '6 pcs', TRUE, 'low', TRUE, '["dairy","popular"]', 10),
('p12', 'Aashirvaad Atta', 'staples', 210, 230, '🌾', '5 kg', TRUE, 'high', FALSE, '["staples"]', 8),
('p13', 'Onions', 'veg-fruits', 35, 50, '🧅', '1 kg', TRUE, 'high', TRUE, '["fresh"]', 30),
('p14', 'Pomegranate', 'veg-fruits', 150, 180, '🍎', '500 g', FALSE, 'out', TRUE, '["fresh"]', 0)
ON CONFLICT (id) DO NOTHING;

-- 6. Create Storage Bucket for product images
-- Run this separately or via Supabase dashboard Storage tab:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', TRUE);
