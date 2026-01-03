-- Supabase PostgreSQL Schema
-- Chạy script này trên Supabase SQL Editor

-- Bảng Sản phẩm
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    sku TEXT UNIQUE NOT NULL,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Biến thể sản phẩm
CREATE TABLE IF NOT EXISTS product_variants (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    variant_type TEXT NOT NULL,
    variant_name TEXT NOT NULL,
    variant_value TEXT NOT NULL,
    price_modifier DECIMAL(10,2) DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Bảng Giá động
CREATE TABLE IF NOT EXISTS dynamic_prices (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    variant_id TEXT,
    price DECIMAL(10,2) NOT NULL,
    source TEXT NOT NULL,
    source_url TEXT,
    crawled_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

-- Bảng Khách hàng
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    address TEXT,
    customer_tier TEXT DEFAULT 'standard',
    discount_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Báo giá
CREATE TABLE IF NOT EXISTS quotes (
    id TEXT PRIMARY KEY,
    quote_number TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    subtotal DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    valid_until DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Bảng Chi tiết báo giá
CREATE TABLE IF NOT EXISTS quote_items (
    id TEXT PRIMARY KEY,
    quote_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    variant_id TEXT,
    variant_info TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);

-- Bảng Quy tắc giá
CREATE TABLE IF NOT EXISTS pricing_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 0,
    rule_type TEXT NOT NULL,
    condition_field TEXT NOT NULL,
    condition_operator TEXT NOT NULL,
    condition_value TEXT NOT NULL,
    discount_type TEXT NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Lịch sử thu thập giá
CREATE TABLE IF NOT EXISTS price_crawl_history (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    source TEXT NOT NULL,
    source_url TEXT,
    price_found DECIMAL(10,2),
    status TEXT,
    error_message TEXT,
    crawled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_prices_product ON dynamic_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_dynamic_prices_active ON dynamic_prices(is_active);

-- Thêm dữ liệu mẫu
INSERT INTO products (id, name, description, category, sku, base_price) VALUES
('prod-001', 'Đào Úc', 'Đào Úc cao cấp, thịt vàng, ngọt tự nhiên', 'Trái cây nhập khẩu', 'PEACH-AU-001', 150000),
('prod-002', 'Nho Mỹ', 'Nho đỏ không hạt từ Mỹ', 'Trái cây nhập khẩu', 'GRAPE-US-001', 120000),
('prod-003', 'Táo Envy', 'Táo Envy New Zealand, giòn ngọt', 'Trái cây nhập khẩu', 'APPLE-NZ-001', 95000);

INSERT INTO product_variants (id, product_id, variant_type, variant_name, variant_value, price_modifier, stock_quantity) VALUES
('var-001', 'prod-001', 'size', 'Kích thước', 'Nhỏ (6-8 trái/kg)', 0, 50),
('var-002', 'prod-001', 'size', 'Kích thước', 'Vừa (4-6 trái/kg)', 20000, 40),
('var-003', 'prod-001', 'size', 'Kích thước', 'Lớn (2-4 trái/kg)', 50000, 30),
('var-004', 'prod-001', 'pack', 'Đóng gói', 'Hộp 1kg', 0, 100),
('var-005', 'prod-001', 'pack', 'Đóng gói', 'Hộp 2kg', -10000, 60),
('var-006', 'prod-001', 'pack', 'Đóng gói', 'Thùng 5kg', -40000, 20),
('var-007', 'prod-001', 'stage', 'Độ chín', 'Chín vừa', 0, 80),
('var-008', 'prod-001', 'stage', 'Độ chín', 'Chín mềm', 0, 40),
('var-009', 'prod-002', 'pack', 'Đóng gói', 'Túi 500g', 0, 100),
('var-010', 'prod-002', 'pack', 'Đóng gói', 'Hộp 1kg', -5000, 80),
('var-011', 'prod-003', 'size', 'Kích thước', 'Size 100 (100-113 trái)', 0, 60),
('var-012', 'prod-003', 'size', 'Kích thước', 'Size 88 (88-100 trái)', 15000, 50);

INSERT INTO customers (id, name, email, phone, company, customer_tier, discount_rate) VALUES
('cust-001', 'Siêu thị BigC', 'procurement@bigc.vn', '0901234567', 'BigC Vietnam', 'vip', 10),
('cust-002', 'Cửa hàng Trái Cây Tươi', 'order@traicaytuoi.vn', '0987654321', 'Trái Cây Tươi', 'premium', 5);

INSERT INTO pricing_rules (id, name, description, priority, rule_type, condition_field, condition_operator, condition_value, discount_type, discount_value, is_active) VALUES
('rule-001', 'Giảm giá theo số lượng > 10kg', 'Giảm 5% cho đơn hàng trên 10kg', 10, 'volume', 'quantity', '>', '10', 'percentage', 5, true),
('rule-002', 'Giảm giá khách VIP', 'Giảm 10% cho khách hàng VIP', 20, 'customer_tier', 'customer_tier', '=', 'vip', 'percentage', 10, true);
