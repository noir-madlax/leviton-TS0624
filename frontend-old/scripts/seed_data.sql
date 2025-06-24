-- Seed data for the Amazon Dimmers & Light Switches Competitor Analysis

-- Insert sample products for Dimmer Switches
INSERT INTO products (name, brand, category, sku_price, unit_price, volume, product_type, url)
VALUES
  ('Kasa Smart 3 Way Dimmer Switch KIT', 'Kasa', 'Dimmer Switches', 42.99, 54.99, 2000, 'Smart', 'https://www.amazon.com/dp/B0BC2MWTR9'),
  ('Lutron Caseta Original Smart Dimmer Switch Kit', 'Lutron', 'Dimmer Switches', 189.90, 94.95, 400, 'Smart', 'https://www.amazon.com/dp/B01M3XJUAD'),
  ('ELEGRP Digital Dimmer Light Switch for 300W', 'ELEGRP', 'Dimmer Switches', 59.99, 30.00, 1000, 'Traditional', 'https://www.amazon.com/dp/B099RJ2HRN'),
  ('Kasa Smart Dimmer Switch HS220', 'Kasa', 'Dimmer Switches', 19.98, 22.99, 3000, 'Smart', 'https://www.amazon.com/dp/B079775ZZQ'),
  ('Leviton SureSlide Dimmer Switch', 'Leviton', 'Dimmer Switches', 14.07, 28.33, 4000, 'Traditional', 'https://www.amazon.com/dp/B0076HPM8A');

-- Insert sample products for Light Switches
INSERT INTO products (name, brand, category, sku_price, unit_price, volume, product_type, url)
VALUES
  ('Kasa Smart Light Switch HS200P3', 'Kasa', 'Light Switches', 42.99, 14.33, 3000, 'Smart', 'https://www.amazon.com/dp/B07HGW8N7R'),
  ('Kasa Smart Light Switch HS200', 'Kasa', 'Light Switches', 16.99, 19.99, 5000, 'Smart', 'https://www.amazon.com/dp/B01EZV35QU'),
  ('Lutron Caseta 3 Way Smart Dimmer Switch Kit', 'Lutron', 'Light Switches', 69.95, 69.95, 1000, 'Smart', 'https://www.amazon.com/dp/B07HM6L48C'),
  ('Kasa Smart 3 Way Switch HS210 KIT', 'Kasa', 'Light Switches', 33.99, 17.00, 2000, 'Smart', 'https://www.amazon.com/dp/B07724HNTX'),
  ('Philips Hue Smart Dimmer Switch with Remote', 'GE', 'Light Switches', 22.49, 3.98, 2000, 'Smart', 'https://www.amazon.com/dp/B08W8GLPD5');

-- Insert brand data
INSERT INTO brands (name, total_products, total_revenue, market_share)
VALUES
  ('Kasa', 8, 497902.00, 20.99),
  ('Lutron', 6, 510094.00, 19.87),
  ('Leviton', 5, 265974.00, 11.21),
  ('GE', 4, 161874.00, 6.82),
  ('ELEGRP', 3, 168140.50, 7.08),
  ('BESTTEN', 3, 86763.50, 3.66),
  ('ENERLITES Store', 2, 51809.50, 2.18),
  ('Amazon', 2, 49061.50, 2.07),
  ('Legrand', 2, 25182.00, 1.06),
  ('TP-Link', 2, 85279.00, 3.59);

-- Insert executive summary
INSERT INTO executive_summary (total_products, total_sales_volume, average_price, total_brands, market_leader, market_leader_share, market_leader_products)
VALUES
  (231, 80050, 32.35, 48, 'Kasa', 20.99, 8);
