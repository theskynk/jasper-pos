-- Migration: create initial tables
-- Run locally:  npx wrangler d1 migrations apply jasper-pos-db --local
-- Run remotely: npx wrangler d1 migrations apply jasper-pos-db --remote

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER  PRIMARY KEY AUTOINCREMENT,
  username      TEXT     NOT NULL UNIQUE,
  password_hash TEXT     NOT NULL,
  role          TEXT     NOT NULL DEFAULT 'staff', -- 'admin' | 'staff' | 'customer'
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed a default admin user (password: changeme — replace before deploying)
-- SHA-256 of "changeme" = 02c75fb22c75b23dc963c7eb91a062cc3169a72c68b3b5400b16cd2b0bc0e45d
INSERT INTO users (username, password_hash, role)
VALUES ('admin', '02c75fb22c75b23dc963c7eb91a062cc3169a72c68b3b5400b16cd2b0bc0e45d', 'admin');

CREATE TABLE IF NOT EXISTS menu_items (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  name        TEXT     NOT NULL,
  description TEXT,
  price       REAL     NOT NULL,
  category    TEXT     NOT NULL,
  available   INTEGER  NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  id         INTEGER  PRIMARY KEY AUTOINCREMENT,
  status     TEXT     NOT NULL DEFAULT 'pending',
  total      REAL     NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id     INTEGER NOT NULL REFERENCES orders(id),
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
  quantity     INTEGER NOT NULL,
  unit_price   REAL    NOT NULL
);

-- Seed menu items for testing
INSERT INTO menu_items (name, description, price, category) VALUES
  ('Espresso',    'Single shot of espresso',         3.50, 'drinks'),
  ('Latte',       'Espresso with steamed milk',       4.50, 'drinks'),
  ('Croissant',   'Buttery plain croissant',          2.50, 'food'),
  ('Club Sandwich', 'Chicken, bacon, lettuce, tomato', 8.00, 'food');
