# Hệ Thống CPQ (Configure, Price, Quote) - Full Stack

Hệ thống báo giá toàn diện với Node.js backend, React frontend, SQLite database, quản lý biến thể sản phẩm, giá động và báo giá tự động.

## 🌿 Tính năng chính

### Quản lý Sản phẩm
- ✅ Thêm, sửa, xóa sản phẩm
- ✅ Quản lý biến thể: Kích thước, Giai đoạn, Đóng gói
- ✅ Theo dõi tồn kho theo biến thể
- ✅ Điều chỉnh giá theo biến thể

### Giá Động
- ✅ Thu thập giá từ Shopee tự động
- ✅ Thu thập giá từ các website khác
- ✅ Nhập giá thủ công
- ✅ Lịch sử thu thập giá
- ✅ So sánh giá từ nhiều nguồn

### Quản lý Báo giá
- ✅ Tạo báo giá nhanh chóng
- ✅ Thêm nhiều sản phẩm vào báo giá
- ✅ Tính toán tự động: giảm giá, thuế, tổng tiền
- ✅ Quản lý trạng thái báo giá
- ✅ Lọc báo giá theo trạng thái

### Quản lý Khách hàng
- ✅ Phân loại khách hàng: Thường, Cao cấp, VIP
- ✅ Thiết lập tỷ lệ chiết khấu riêng
- ✅ Lưu trữ thông tin liên hệ đầy đủ

## 🎨 Giao diện

- Thiết kế màu sắc: Tông màu đất, xanh lá và hồng pastel
- Giao diện tiếng Việt hoàn toàn
- Responsive, thân thiện với người dùng
- Theme màu:
  - Earth tones: #8B7355, #5D4E37, #D2B48C
  - Greens: #6B8E23, #556B2F, #9ACD32, #87A96B
  - Pink: #E9B4B8, #F5D5D8, #D8A7AB

## 🚀 Cài đặt và Chạy

### Yêu cầu
- Node.js 18+
- npm hoặc yarn

### Bước 1: Cài đặt dependencies

```bash
# Cài đặt backend
cd backend
npm install

# Cài đặt frontend
cd ../frontend
npm install
```

### Bước 2: Khởi tạo database

```bash
cd backend
npm run init-db
```

### Bước 3: Chạy ứng dụng

#### Chạy Backend (Terminal 1)
```bash
cd backend
npm run dev
```

Backend sẽ chạy tại: http://localhost:3001

#### Chạy Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3000

## 📁 Cấu trúc thư mục

```
Price-quote/
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   ├── schema.sql      # Database schema
│   │   │   ├── init.js         # Khởi tạo DB + dữ liệu mẫu
│   │   │   └── db.js           # Database connection
│   │   ├── models/
│   │   │   ├── Product.js      # Model sản phẩm
│   │   │   ├── ProductVariant.js
│   │   │   ├── DynamicPrice.js
│   │   │   ├── Quote.js
│   │   │   └── Customer.js
│   │   ├── routes/
│   │   │   ├── products.js     # API routes sản phẩm
│   │   │   ├── quotes.js
│   │   │   └── customers.js
│   │   ├── services/
│   │   │   └── priceCrawler.js # Thu thập giá từ web
│   │   └── server.js           # Express server
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProductForm.jsx
│   │   │   ├── CustomerForm.jsx
│   │   │   ├── QuoteForm.jsx
│   │   │   ├── VariantManager.jsx
│   │   │   └── PriceManager.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ProductsPage.jsx
│   │   │   ├── QuotesPage.jsx
│   │   │   └── CustomersPage.jsx
│   │   ├── services/
│   │   │   └── api.js          # API client
│   │   ├── styles/
│   │   │   ├── theme.css       # Color theme
│   │   │   └── App.css         # Global styles
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README_FULLSTACK.md
```

## 🗄️ Database Schema

### Tables
- **products**: Sản phẩm cơ bản
- **product_variants**: Biến thể sản phẩm (size, stage, pack)
- **dynamic_prices**: Giá động từ nhiều nguồn
- **customers**: Khách hàng
- **quotes**: Báo giá
- **quote_items**: Chi tiết sản phẩm trong báo giá
- **pricing_rules**: Quy tắc giá tự động
- **price_crawl_history**: Lịch sử thu thập giá

## 🔌 API Endpoints

### Products
- `GET /api/products` - Lấy tất cả sản phẩm
- `GET /api/products/:id` - Lấy chi tiết sản phẩm (kèm variants & prices)
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm
- `GET /api/products/search?q=...` - Tìm kiếm sản phẩm

### Product Variants
- `GET /api/products/:id/variants` - Lấy biến thể của sản phẩm
- `POST /api/products/:id/variants` - Thêm biến thể
- `PUT /api/products/:id/variants/:variantId` - Cập nhật biến thể
- `DELETE /api/products/:id/variants/:variantId` - Xóa biến thể

### Dynamic Pricing
- `GET /api/products/:id/prices` - Lấy giá hiện tại
- `POST /api/products/:id/prices` - Thêm giá mới (thủ công)
- `POST /api/products/:id/crawl-price` - Thu thập giá từ web
- `GET /api/products/:id/price-history` - Lịch sử thu thập

### Quotes
- `GET /api/quotes` - Lấy tất cả báo giá
- `GET /api/quotes?status=...` - Lọc theo trạng thái
- `GET /api/quotes/:id` - Lấy chi tiết báo giá
- `POST /api/quotes` - Tạo báo giá mới
- `PUT /api/quotes/:id` - Cập nhật báo giá
- `PATCH /api/quotes/:id/status` - Cập nhật trạng thái
- `DELETE /api/quotes/:id` - Xóa báo giá
- `POST /api/quotes/:id/items` - Thêm sản phẩm vào báo giá
- `DELETE /api/quotes/:id/items/:itemId` - Xóa sản phẩm khỏi báo giá

### Customers
- `GET /api/customers` - Lấy tất cả khách hàng
- `GET /api/customers/:id` - Lấy chi tiết khách hàng
- `POST /api/customers` - Tạo khách hàng mới
- `PUT /api/customers/:id` - Cập nhật khách hàng
- `DELETE /api/customers/:id` - Xóa khách hàng
- `GET /api/customers/search?q=...` - Tìm kiếm khách hàng

## 🔧 Cấu hình

### Backend (.env)
```
PORT=3001
DATABASE_PATH=./database.sqlite
NODE_ENV=development
```

### Frontend
Proxy tự động chuyển `/api/*` requests đến backend tại port 3001.

## 💡 Sử dụng

### 1. Thêm sản phẩm
- Vào trang "Sản phẩm"
- Nhấn "Thêm sản phẩm mới"
- Điền thông tin: Tên, SKU, Danh mục, Giá cơ bản

### 2. Quản lý biến thể
- Trong danh sách sản phẩm, nhấn nút "Biến thể"
- Chọn loại: Kích thước / Giai đoạn / Đóng gói
- Nhập thông tin biến thể và điều chỉnh giá
- Cập nhật tồn kho

### 3. Thu thập giá
- Trong danh sách sản phẩm, nhấn nút "Giá"
- **Thu thập từ web:**
  - Chọn nguồn (Shopee hoặc Website khác)
  - Dán URL sản phẩm
  - Nhấn "Thu thập giá"
- **Nhập thủ công:**
  - Nhập giá và ghi chú
  - Nhấn "Thêm giá"

### 4. Tạo báo giá
- Vào trang "Báo giá"
- Nhấn "Tạo báo giá mới"
- Chọn khách hàng
- Thêm sản phẩm vào báo giá
- Điều chỉnh số lượng và giảm giá
- Xem tổng tiền tự động tính
- Lưu báo giá

### 5. Quản lý khách hàng
- Vào trang "Khách hàng"
- Thêm khách hàng mới với thông tin đầy đủ
- Phân loại hạng: Thường / Cao cấp / VIP
- Thiết lập tỷ lệ chiết khấu riêng

## 🎯 Dữ liệu mẫu

Database được khởi tạo với dữ liệu mẫu:

**Sản phẩm:**
- Đào Úc (với biến thể kích thước, đóng gói, độ chín)
- Nho Mỹ (với biến thể đóng gói)
- Táo Envy (với biến thể kích thước)

**Khách hàng:**
- Siêu thị BigC (VIP, chiết khấu 10%)
- Cửa hàng Trái Cây Tươi (Cao cấp, chiết khấu 5%)

**Quy tắc giá:**
- Giảm 5% cho đơn hàng > 10kg
- Giảm 10% cho khách hàng VIP

## 🛠️ Công nghệ sử dụng

### Backend
- Node.js + Express
- SQLite (better-sqlite3)
- Axios + Cheerio (web scraping)

### Frontend
- React 18
- React Router
- Vite
- Lucide React (icons)
- Axios (HTTP client)

## 📝 License

MIT
