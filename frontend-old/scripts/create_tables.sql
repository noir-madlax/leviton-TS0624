-- Create tables for the Amazon Dimmers & Light Switches Competitor Analysis

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Dimmer Switches', 'Light Switches')),
  sku_price DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  volume INTEGER NOT NULL,
  revenue DECIMAL(12, 2) GENERATED ALWAYS AS (sku_price * volume) STORED,
  product_type TEXT NOT NULL CHECK (product_type IN ('Smart', 'Traditional')),
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  total_products INTEGER NOT NULL,
  total_revenue DECIMAL(12, 2) NOT NULL,
  market_share DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Executive summary table
CREATE TABLE IF NOT EXISTS executive_summary (
  id SERIAL PRIMARY KEY,
  total_products INTEGER NOT NULL,
  total_sales_volume INTEGER NOT NULL,
  average_price DECIMAL(10, 2) NOT NULL,
  total_brands INTEGER NOT NULL,
  market_leader TEXT NOT NULL,
  market_leader_share DECIMAL(5, 2) NOT NULL,
  market_leader_products INTEGER NOT NULL,
  report_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
