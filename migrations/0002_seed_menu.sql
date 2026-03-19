-- Migration: seed initial menu items
-- Run locally:  npx wrangler d1 migrations apply jasper-pos --local
-- Run remotely: npx wrangler d1 migrations apply jasper-pos --remote

INSERT INTO menu_items (name, description, price, category) VALUES
  ('Espresso',      'Single shot of espresso',          3.50, 'drinks'),
  ('Latte',         'Espresso with steamed milk',        4.50, 'drinks'),
  ('Croissant',     'Buttery plain croissant',           2.50, 'food'),
  ('Club Sandwich', 'Chicken, bacon, lettuce, tomato',   8.00, 'food');
