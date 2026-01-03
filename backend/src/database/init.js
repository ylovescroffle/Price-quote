import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || './database.sqlite';
const db = new Database(dbPath);

// Đọc và thực thi schema
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

console.log('✓ Database schema đã được khởi tạo');

// Thêm dữ liệu mẫu
const insertSampleData = () => {
  const insert = db.transaction(() => {
    // Sản phẩm mẫu
    const products = [
      {
        id: 'prod-001',
        name: 'Đào Úc',
        description: 'Đào Úc cao cấp, thịt vàng, ngọt tự nhiên',
        category: 'Trái cây nhập khẩu',
        sku: 'PEACH-AU-001',
        base_price: 150000
      },
      {
        id: 'prod-002',
        name: 'Nho Mỹ',
        description: 'Nho đỏ không hạt từ Mỹ',
        category: 'Trái cây nhập khẩu',
        sku: 'GRAPE-US-001',
        base_price: 120000
      },
      {
        id: 'prod-003',
        name: 'Táo Envy',
        description: 'Táo Envy New Zealand, giòn ngọt',
        category: 'Trái cây nhập khẩu',
        sku: 'APPLE-NZ-001',
        base_price: 95000
      }
    ];

    const insertProduct = db.prepare(
      'INSERT INTO products (id, name, description, category, sku, base_price) VALUES (?, ?, ?, ?, ?, ?)'
    );

    products.forEach(p => {
      insertProduct.run(p.id, p.name, p.description, p.category, p.sku, p.base_price);
    });

    // Biến thể sản phẩm
    const variants = [
      // Đào - Kích thước
      { id: 'var-001', product_id: 'prod-001', variant_type: 'size', variant_name: 'Kích thước', variant_value: 'Nhỏ (6-8 trái/kg)', price_modifier: 0, stock_quantity: 50 },
      { id: 'var-002', product_id: 'prod-001', variant_type: 'size', variant_name: 'Kích thước', variant_value: 'Vừa (4-6 trái/kg)', price_modifier: 20000, stock_quantity: 40 },
      { id: 'var-003', product_id: 'prod-001', variant_type: 'size', variant_name: 'Kích thước', variant_value: 'Lớn (2-4 trái/kg)', price_modifier: 50000, stock_quantity: 30 },

      // Đào - Đóng gói
      { id: 'var-004', product_id: 'prod-001', variant_type: 'pack', variant_name: 'Đóng gói', variant_value: 'Hộp 1kg', price_modifier: 0, stock_quantity: 100 },
      { id: 'var-005', product_id: 'prod-001', variant_type: 'pack', variant_name: 'Đóng gói', variant_value: 'Hộp 2kg', price_modifier: -10000, stock_quantity: 60 },
      { id: 'var-006', product_id: 'prod-001', variant_type: 'pack', variant_name: 'Đóng gói', variant_value: 'Thùng 5kg', price_modifier: -40000, stock_quantity: 20 },

      // Đào - Giai đoạn
      { id: 'var-007', product_id: 'prod-001', variant_type: 'stage', variant_name: 'Độ chín', variant_value: 'Chín vừa', price_modifier: 0, stock_quantity: 80 },
      { id: 'var-008', product_id: 'prod-001', variant_type: 'stage', variant_name: 'Độ chín', variant_value: 'Chín mềm', price_modifier: 0, stock_quantity: 40 },

      // Nho - Kích thước
      { id: 'var-009', product_id: 'prod-002', variant_type: 'pack', variant_name: 'Đóng gói', variant_value: 'Túi 500g', price_modifier: 0, stock_quantity: 100 },
      { id: 'var-010', product_id: 'prod-002', variant_type: 'pack', variant_name: 'Đóng gói', variant_value: 'Hộp 1kg', price_modifier: -5000, stock_quantity: 80 },

      // Táo - Kích thước
      { id: 'var-011', product_id: 'prod-003', variant_type: 'size', variant_name: 'Kích thước', variant_value: 'Size 100 (100-113 trái)', price_modifier: 0, stock_quantity: 60 },
      { id: 'var-012', product_id: 'prod-003', variant_type: 'size', variant_name: 'Kích thước', variant_value: 'Size 88 (88-100 trái)', price_modifier: 15000, stock_quantity: 50 },
    ];

    const insertVariant = db.prepare(
      'INSERT INTO product_variants (id, product_id, variant_type, variant_name, variant_value, price_modifier, stock_quantity) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );

    variants.forEach(v => {
      insertVariant.run(v.id, v.product_id, v.variant_type, v.variant_name, v.variant_value, v.price_modifier, v.stock_quantity);
    });

    // Khách hàng mẫu
    const customers = [
      {
        id: 'cust-001',
        name: 'Siêu thị BigC',
        email: 'procurement@bigc.vn',
        phone: '0901234567',
        company: 'BigC Vietnam',
        customer_tier: 'vip',
        discount_rate: 10
      },
      {
        id: 'cust-002',
        name: 'Cửa hàng Trái Cây Tươi',
        email: 'order@traicaytuoi.vn',
        phone: '0987654321',
        company: 'Trái Cây Tươi',
        customer_tier: 'premium',
        discount_rate: 5
      }
    ];

    const insertCustomer = db.prepare(
      'INSERT INTO customers (id, name, email, phone, company, customer_tier, discount_rate) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );

    customers.forEach(c => {
      insertCustomer.run(c.id, c.name, c.email, c.phone, c.company, c.customer_tier, c.discount_rate);
    });

    // Quy tắc giá
    const pricingRules = [
      {
        id: 'rule-001',
        name: 'Giảm giá theo số lượng > 10kg',
        description: 'Giảm 5% cho đơn hàng trên 10kg',
        priority: 10,
        rule_type: 'volume',
        condition_field: 'quantity',
        condition_operator: '>',
        condition_value: '10',
        discount_type: 'percentage',
        discount_value: 5,
        is_active: 1
      },
      {
        id: 'rule-002',
        name: 'Giảm giá khách VIP',
        description: 'Giảm 10% cho khách hàng VIP',
        priority: 20,
        rule_type: 'customer_tier',
        condition_field: 'customer_tier',
        condition_operator: '=',
        condition_value: 'vip',
        discount_type: 'percentage',
        discount_value: 10,
        is_active: 1
      }
    ];

    const insertRule = db.prepare(
      'INSERT INTO pricing_rules (id, name, description, priority, rule_type, condition_field, condition_operator, condition_value, discount_type, discount_value, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    pricingRules.forEach(r => {
      insertRule.run(r.id, r.name, r.description, r.priority, r.rule_type, r.condition_field, r.condition_operator, r.condition_value, r.discount_type, r.discount_value, r.is_active);
    });
  });

  insert();
  console.log('✓ Dữ liệu mẫu đã được thêm vào database');
};

insertSampleData();

db.close();
console.log('✓ Database đã sẵn sàng sử dụng');
