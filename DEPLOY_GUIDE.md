# 🚀 Hướng dẫn Deploy Hệ thống CPQ

## Tổng quan

Hệ thống này gồm 2 phần:
- **Frontend (React)** → Deploy lên **Vercel** (miễn phí)
- **Backend (Node.js + SQLite)** → Deploy lên **Railway** hoặc **Render** (miễn phí)

---

## 📦 PHẦN 1: Deploy Backend

### Option A: Railway (Khuyến nghị - Dễ nhất)

#### Bước 1: Tạo tài khoản Railway
1. Truy cập: https://railway.app
2. Đăng ký bằng GitHub
3. Bạn sẽ có **$5 credit miễn phí mỗi tháng**

#### Bước 2: Deploy Backend

**Cách 1: Deploy qua GitHub (Khuyến nghị)**

```bash
# Push code lên GitHub
git add .
git commit -m "Prepare for deployment"
git push origin main

# Trên Railway.app:
# 1. New Project → Deploy from GitHub repo
# 2. Chọn repository: Price-quote
# 3. Chọn Root Directory: backend
# 4. Railway sẽ tự động detect và deploy
```

**Cách 2: Deploy qua Railway CLI**

```bash
# Cài Railway CLI
npm install -g @railway/cli

# Login
railway login

# Từ thư mục gốc
cd backend

# Init và deploy
railway init
railway up

# Chạy database init
railway run npm run init-db
```

#### Bước 3: Lấy URL Backend

Sau khi deploy xong:
1. Vào Railway Dashboard
2. Click vào service vừa tạo
3. Tab "Settings" → Generate Domain
4. Copy URL (VD: `https://cpq-backend-production.up.railway.app`)

#### Bước 4: Cấu hình Environment Variables trên Railway

Vào Settings → Variables, thêm:
```
NODE_ENV=production
PORT=3001
DATABASE_PATH=./database.sqlite
FRONTEND_URL=https://your-app.vercel.app
```

---

### Option B: Render.com (Miễn phí nhưng chậm hơn)

#### Bước 1: Tạo tài khoản
1. Truy cập: https://render.com
2. Đăng ký bằng GitHub

#### Bước 2: Deploy
1. New → Web Service
2. Connect Repository: Price-quote
3. Cấu hình:
   - **Name**: cpq-backend
   - **Region**: Singapore
   - **Branch**: main
   - **Root Directory**: backend
   - **Build Command**: `npm install && npm run init-db`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. Environment Variables:
   ```
   NODE_ENV=production
   DATABASE_PATH=./database.sqlite
   FRONTEND_URL=https://your-app.vercel.app
   ```

5. Click "Create Web Service"

#### Bước 3: Lấy URL
Copy URL từ dashboard (VD: `https://cpq-backend.onrender.com`)

⚠️ **Lưu ý**: Free tier của Render sẽ sleep sau 15 phút không dùng, lần đầu truy cập có thể chậm.

---

## 🎨 PHẦN 2: Deploy Frontend lên Vercel

### Bước 1: Cập nhật Environment Variable

Sửa file `frontend/.env.production`:
```env
VITE_API_URL=https://cpq-backend-production.up.railway.app
```

Thay URL bằng URL backend bạn vừa deploy ở bước trước.

### Bước 2: Deploy lên Vercel

**Cách 1: Deploy qua Vercel Dashboard (Dễ nhất)**

```bash
# Commit thay đổi
git add .
git commit -m "Update API URL for production"
git push origin main

# Trên Vercel.com:
# 1. Import Project → GitHub repository
# 2. Chọn repository: Price-quote
# 3. Framework Preset: Vite
# 4. Root Directory: frontend
# 5. Build Command: npm run build
# 6. Output Directory: dist
# 7. Install Command: npm install
```

Thêm Environment Variable:
```
VITE_API_URL=https://cpq-backend-production.up.railway.app
```

Click **Deploy**!

**Cách 2: Deploy qua Vercel CLI**

```bash
# Từ thư mục gốc
cd frontend

# Login Vercel
vercel login

# Deploy
vercel

# Khi được hỏi, trả lời:
# Set up and deploy? Yes
# Which scope? (Chọn account của bạn)
# Link to existing project? No
# Project name? cpq-frontend
# Directory? ./
# Override settings? No

# Deploy production
vercel --prod
```

### Bước 3: Lấy URL Frontend

Copy URL từ Vercel (VD: `https://cpq-frontend.vercel.app`)

### Bước 4: Cập nhật CORS trên Backend

Quay lại Railway/Render, cập nhật environment variable:
```
FRONTEND_URL=https://cpq-frontend.vercel.app
```

Restart backend service.

---

## ✅ Kiểm tra Deployment

### 1. Test Backend API
```bash
curl https://your-backend-url.railway.app/api/health
```

Kết quả:
```json
{"status":"OK","message":"CPQ API đang hoạt động"}
```

### 2. Test Frontend
Mở browser, truy cập: `https://cpq-frontend.vercel.app`

Kiểm tra:
- ✅ Trang chủ hiển thị đúng
- ✅ Xem được danh sách sản phẩm (data từ backend)
- ✅ Xem được danh sách khách hàng
- ✅ Tạo được báo giá mới

---

## 🔧 Troubleshooting

### Lỗi: CORS Error
**Nguyên nhân**: Frontend URL chưa được thêm vào CORS whitelist

**Giải pháp**:
1. Vào Railway/Render
2. Thêm environment variable: `FRONTEND_URL=https://cpq-frontend.vercel.app`
3. Restart service

### Lỗi: Cannot connect to backend
**Nguyên nhân**: API URL sai hoặc backend chưa chạy

**Giải pháp**:
1. Kiểm tra `frontend/.env.production` có đúng URL không
2. Test backend API bằng curl
3. Check logs trên Railway/Render

### Lỗi: Database not initialized
**Nguyên nhân**: Database chưa được init

**Giải pháp**:
```bash
# Trên Railway
railway run npm run init-db

# Trên Render
# Sửa Build Command thành: npm install && npm run init-db
```

### Lỗi: 404 Not Found
**Nguyên nhân**: Routes không đúng

**Giải pháp**:
1. Kiểm tra Root Directory đã đúng chưa (backend cho backend, frontend cho frontend)
2. Kiểm tra Build Command và Start Command

---

## 💡 Tips

### 1. Xem Logs
**Railway**: Click vào service → Tab "Deployments" → Click deployment → View Logs

**Render**: Dashboard → Service → Tab "Logs"

**Vercel**: Dashboard → Project → Tab "Functions" → View Logs

### 2. Custom Domain (Tùy chọn)

**Vercel**:
1. Settings → Domains
2. Thêm domain của bạn
3. Cập nhật DNS records

**Railway**:
1. Settings → Networking → Custom Domain
2. Thêm domain và cập nhật CNAME

### 3. Monitoring

**Backend**: Thêm monitoring với [UptimeRobot](https://uptimerobot.com) (miễn phí)
- Monitor URL: `https://your-backend/api/health`
- Interval: 5 phút

### 4. Database Backup

**Railway**: Tự động backup
**Render**: Cần manual backup

Export database:
```bash
# Local
cd backend
cp database.sqlite database.backup.sqlite

# Upload lên cloud storage (Google Drive, Dropbox, etc)
```

---

## 📊 So sánh Platforms

| Platform | Frontend | Backend | Database | Free Tier | Speed |
|----------|----------|---------|----------|-----------|-------|
| **Vercel** | ✅ Tốt nhất | ❌ Không hỗ trợ SQLite | ❌ | Unlimited | ⚡ Rất nhanh |
| **Railway** | ⚠️ OK | ✅ Tốt | ✅ SQLite | $5/tháng | ⚡ Nhanh |
| **Render** | ⚠️ OK | ✅ Tốt | ✅ SQLite | Free | 🐌 Chậm (sleep) |

**Khuyến nghị**:
- Frontend: **Vercel**
- Backend: **Railway** (tốt nhất) hoặc **Render** (miễn phí hoàn toàn)

---

## 🎯 Quick Deploy Commands

```bash
# 1. Deploy Backend lên Railway
cd backend
railway login
railway init
railway up
railway run npm run init-db

# 2. Lấy URL backend và update frontend/.env.production

# 3. Deploy Frontend lên Vercel
cd ../frontend
vercel login
vercel --prod

# 4. Lấy URL frontend và update FRONTEND_URL trên Railway

# 5. Done! 🎉
```

---

## 🆘 Cần giúp đỡ?

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
