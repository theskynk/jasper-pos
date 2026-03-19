-- Migration: create initial tables
-- Run locally:  npx wrangler d1 migrations apply jasper-pos --local
-- Run remotely: npx wrangler d1 migrations apply jasper-pos --remote

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
  name_en     TEXT     NOT NULL,
  name_th     TEXT     NOT NULL,
  description TEXT,
  price       REAL     NOT NULL,
  category    TEXT     NOT NULL,
  available   INTEGER  NOT NULL DEFAULT 1,
  image_url   TEXT
);

CREATE TABLE IF NOT EXISTS tables (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  name     TEXT    NOT NULL UNIQUE, -- e.g. 'Table 1', 'Bar', 'Terrace 2'
  capacity INTEGER NOT NULL DEFAULT 4,
  active   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS table_sessions (
  id         INTEGER  PRIMARY KEY AUTOINCREMENT,
  table_id   INTEGER  NOT NULL REFERENCES tables(id),
  status     TEXT     NOT NULL DEFAULT 'open', -- 'open' | 'billed' | 'paid' | 'cancelled'
  opened_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at  DATETIME
);

CREATE TABLE IF NOT EXISTS orders (
  id               INTEGER  PRIMARY KEY AUTOINCREMENT,
  table_session_id INTEGER  REFERENCES table_sessions(id),
  status           TEXT     NOT NULL DEFAULT 'pending',
  total            REAL     NOT NULL DEFAULT 0,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id     INTEGER NOT NULL REFERENCES orders(id),
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
  quantity     INTEGER NOT NULL,
  unit_price   REAL    NOT NULL
);

-- Seed menu items
INSERT INTO menu_items (name_en, name_th, description, price, category) VALUES
  ('Espresso',      'เอสเปรสโซ่',     'Single shot of espresso',         3.50, 'drinks'),
  ('Latte',         'ลาเต้',           'Espresso with steamed milk',       4.50, 'drinks'),
  ('Croissant',     'ครัวซองต์',       'Buttery plain croissant',          2.50, 'food'),
  ('Club Sandwich', 'คลับแซนด์วิช',   'Chicken, bacon, lettuce, tomato',  8.00, 'food');

-- Seed tables
INSERT INTO tables (name, capacity) VALUES
  ('Table 1', 4),
  ('Table 2', 4),
  ('Table 3', 4),
  ('Table 4', 2),
  ('Bar',     6);
