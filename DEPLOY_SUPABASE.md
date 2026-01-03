# 🚀 Deploy với Supabase + Vercel

Hướng dẫn deploy hệ thống CPQ sử dụng:
- **Database**: Supabase (PostgreSQL - miễn phí)
- **Frontend**: Vercel (miễn phí)
- **Backend**: Render.com (miễn phí)

---

## 📋 BƯỚC 1: Setup Supabase Database (5 phút)

### 1.1. Tạo Project

1. Truy cập: https://supabase.com
2. **Sign up** (miễn phí - không cần thẻ tín dụng)
3. Click **New Project**
4. Điền thông tin:
   - **Name**: `cpq-system`
   - **Database Password**: Tạo password mạnh (lưu lại!)
   - **Region**: **Singapore** (gần Việt Nam nhất)
   - **Pricing Plan**: **Free** (đủ dùng)
5. Click **Create new project**
6. Đợi ~2 phút để database khởi động

### 1.2. Lấy Database URL

1. Sau khi project sẵn sàng, click vào **Project Settings** (biểu tượng ⚙️)
2. Chọn **Database** trong menu bên trái
3. Scroll xuống phần **Connection string**
4. Chọn tab **URI**
5. Copy connection string (dạng này):
```
postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

⚠️ **Lưu ý**: Thay `[YOUR-PASSWORD]` bằng password bạn đã tạo ở bước 1.1

### 1.3. Tạo Tables và Import Data

1. Trong Supabase Dashboard, click **SQL Editor** (bên trái)
2. Click **New query**
3. Copy toàn bộ nội dung file `backend/src/database/supabase-schema.sql`
4. Paste vào SQL Editor
5. Click **Run** (hoặc Ctrl+Enter)
6. Bạn sẽ thấy: ✅ **Success. No rows returned**

### 1.4. Kiểm tra Tables

1. Click **Table Editor** (bên trái)
2. Bạn sẽ thấy các tables:
   - products (3 rows)
   - product_variants (12 rows)
   - customers (2 rows)
   - quotes
   - quote_items
   - dynamic_prices
   - pricing_rules (2 rows)
   - price_crawl_history

✅ Database đã sẵn sàng!

---

## 📋 BƯỚC 2: Deploy Backend lên Render.com (5 phút)

### 2.1. Tạo tài khoản Render

1. Truy cập: https://render.com
2. **Sign up** với GitHub
3. Authorize Render để access GitHub repos

### 2.2. Push code lên GitHub (nếu chưa)

```bash
# Nếu chưa có remote repository
git remote add origin https://github.com/your-username/Price-quote.git
git branch -M main
git push -u origin main
```

### 2.3. Deploy Backend

1. Trên Render Dashboard, click **New +**
2. Chọn **Web Service**
3. Click **Build and deploy from a Git repository**
4. Click **Connect** bên cạnh repository `Price-quote`
5. Điền thông tin:

**Basic:**
- **Name**: `cpq-backend`
- **Region**: **Singapore**
- **Branch**: `main` hoặc `claude/create-cpq-system-XmykS`
- **Root Directory**: `backend`

**Build & Deploy:**
- **Runtime**: **Node**
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Plan:**
- Chọn **Free** (miễn phí)

6. Click **Advanced** → **Add Environment Variable**

Thêm các biến sau:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://postgres.xxx:...` (URL từ Supabase) |
| `FRONTEND_URL` | `*` (tạm thời, sẽ update sau) |

7. Click **Create Web Service**

### 2.4. Đợi Deploy

- Render sẽ build và deploy (~3-5 phút)
- Theo dõi logs trong tab **Logs**
- Khi thấy: `🚀 Server đang chạy tại...` → Thành công!

### 2.5. Lấy Backend URL

Ở trên cùng, copy URL (VD: `https://cpq-backend.onrender.com`)

### 2.6. Test Backend

Mở browser hoặc dùng curl:
```bash
curl https://cpq-backend.onrender.com/api/health
```

Kết quả:
```json
{"status":"OK","message":"CPQ API đang hoạt động"}
```

✅ Backend đã chạy!

---

## 📋 BƯỚC 3: Deploy Frontend lên Vercel (3 phút)

### 3.1. Cập nhật API URL

Tạo file `frontend/.env.production`:
```env
VITE_API_URL=https://cpq-backend.onrender.com
```

**Thay URL bằng URL backend của bạn từ bước 2.5!**

### 3.2. Commit thay đổi

```bash
git add frontend/.env.production
git commit -m "Add production API URL"
git push
```

### 3.3. Deploy lên Vercel

**Cách 1: Qua Vercel Dashboard (Dễ nhất)**

1. Truy cập: https://vercel.com
2. **Sign up** với GitHub
3. Click **Add New...** → **Project**
4. **Import Git Repository** → Chọn `Price-quote`
5. Cấu hình:
   - **Framework Preset**: **Vite**
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (để mặc định)
   - **Output Directory**: `dist` (để mặc định)
   - **Install Command**: `npm install` (để mặc định)

6. Click **Environment Variables**:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://cpq-backend.onrender.com` |

7. Click **Deploy**!

**Cách 2: Qua CLI**

```bash
# Cài Vercel CLI (nếu chưa)
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod

# Khi được hỏi Environment Variables:
# VITE_API_URL=https://cpq-backend.onrender.com
```

### 3.4. Lấy Frontend URL

Sau khi deploy xong, copy URL (VD: `https://cpq-frontend.vercel.app`)

---

## 📋 BƯỚC 4: Cập nhật CORS (1 phút)

### 4.1. Update FRONTEND_URL trên Render

1. Vào Render Dashboard
2. Click vào service `cpq-backend`
3. Tab **Environment**
4. Sửa `FRONTEND_URL`:
   - Từ: `*`
   - Thành: `https://cpq-frontend.vercel.app`
5. Click **Save Changes**
6. Service sẽ tự động redeploy

---

## 🎉 Hoàn thành!

Bây giờ bạn có:

✅ **Database**: Supabase PostgreSQL
✅ **Backend**: https://cpq-backend.onrender.com
✅ **Frontend**: https://cpq-frontend.vercel.app

### Test hệ thống:

1. Mở: https://cpq-frontend.vercel.app
2. Vào trang **Sản phẩm** → Sẽ thấy 3 sản phẩm mẫu
3. Vào trang **Khách hàng** → Sẽ thấy 2 khách hàng
4. Thử tạo **Báo giá mới**!

---

## ⚠️ Lưu ý quan trọng về Render Free Tier

**Render Free tier sẽ "ngủ" (sleep) sau 15 phút không sử dụng.**

Khi frontend gọi API lần đầu sau khi sleep:
- Backend sẽ mất ~30-60 giây để "thức dậy"
- Người dùng sẽ thấy loading lâu hơn
- Những request sau sẽ nhanh trở lại

**Giải pháp:**
1. **Upgrade lên paid plan** ($7/tháng) - không sleep
2. **Dùng cron job** để ping backend mỗi 10 phút:
   - Dùng cron-job.org hoặc UptimeRobot (miễn phí)
   - Ping URL: `https://cpq-backend.onrender.com/api/health`
   - Interval: 10 phút

---

## 🔧 Troubleshooting

### Lỗi: Cannot connect to database

**Nguyên nhân**: DATABASE_URL sai hoặc Supabase chưa khởi tạo xong

**Giải pháp**:
1. Kiểm tra DATABASE_URL có đúng không
2. Kiểm tra password có đúng không
3. Test connection từ local:
```bash
cd backend
npm install
# Tạo .env với DATABASE_URL
node -e "import('pg').then(pg => { const pool = new pg.Pool({connectionString: process.env.DATABASE_URL, ssl: {rejectUnauthorized: false}}); pool.query('SELECT NOW()', (err, res) => { console.log(err ? err : res.rows[0]); pool.end(); }); });"
```

### Lỗi: CORS policy error

**Nguyên nhân**: FRONTEND_URL chưa được cập nhật

**Giải pháp**:
1. Vào Render → Environment Variables
2. Update `FRONTEND_URL` với URL Vercel chính xác
3. Save và đợi redeploy

### Lỗi: 404 Not Found trên API

**Nguyên nhân**: Root Directory sai

**Giải pháp**:
1. Vào Render → Settings
2. Kiểm tra **Root Directory** = `backend`
3. Kiểm tra **Start Command** = `npm start`

### Frontend không load được data

**Nguyên nhân**: API URL sai hoặc backend chưa chạy

**Giải pháp**:
1. Mở browser DevTools → Network
2. Xem request đang gọi đến đâu
3. Kiểm tra `VITE_API_URL` trên Vercel
4. Test backend: `curl https://your-backend/api/health`

---

## 💡 Tips

### 1. Xem Logs

**Supabase:**
- Dashboard → Database → Logs

**Render:**
- Dashboard → Service → Logs tab

**Vercel:**
- Dashboard → Project → Deployments → Click deployment → View Function Logs

### 2. Quản lý Database

**Supabase Dashboard:**
- **Table Editor**: Xem/sửa data trực tiếp
- **SQL Editor**: Chạy queries
- **Database**: Backup & restore

**Hoặc dùng tool:**
```bash
# Cài DBeaver hoặc pgAdmin
# Connection:
# Host: aws-0-ap-southeast-1.pooler.supabase.com
# Port: 5432
# Database: postgres
# User: postgres.xxx
# Password: [your-password]
```

### 3. Backup Database

```bash
# Export từ Supabase
# Vào SQL Editor, chạy:
COPY (SELECT * FROM products) TO STDOUT WITH CSV HEADER;

# Hoặc dùng pg_dump:
pg_dump "postgresql://postgres.xxx:..." > backup.sql
```

---

## 📊 Chi phí

| Service | Plan | Giới hạn | Chi phí |
|---------|------|----------|---------|
| **Supabase** | Free | 500MB database, 2GB transfer | 🆓 $0/tháng |
| **Render** | Free | 750h/tháng, sleep sau 15min | 🆓 $0/tháng |
| **Vercel** | Hobby | 100GB bandwidth | 🆓 $0/tháng |

**Tổng**: 🆓 **MIỄN PHÍ HOÀN TOÀN**

---

## 🚀 Next Steps

Sau khi deploy xong, bạn có thể:

1. **Custom domain**: Thêm domain riêng trên Vercel
2. **Analytics**: Thêm Google Analytics
3. **Monitoring**: Setup UptimeRobot để theo dõi uptime
4. **Backup tự động**: Schedule backup database hàng tuần

---

Chúc bạn deploy thành công! 🎉
