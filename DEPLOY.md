# Hướng dẫn Deploy lên Vercel

## 🚀 Các bước deploy

### Chuẩn bị

⚠️ **Lưu ý quan trọng về Database:**
Vercel không hỗ trợ SQLite trực tiếp vì môi trường serverless. Bạn có 3 lựa chọn:

1. **Vercel Postgres** (Khuyến nghị) - Miễn phí cho hobby projects
2. **Supabase** - Database PostgreSQL miễn phí
3. **Turso** - SQLite serverless

## Option 1: Sử dụng Vercel Postgres (Khuyến nghị)

### Bước 1: Tạo Vercel Postgres Database

```bash
# Login vào Vercel
vercel login

# Link project
vercel link

# Tạo Postgres database
vercel postgres create
```

### Bước 2: Cài đặt dependencies cho Postgres

```bash
cd backend
npm install @vercel/postgres pg
```

### Bước 3: Deploy

```bash
# Từ thư mục gốc
vercel --prod
```

## Option 2: Deploy riêng Frontend + Backend

### A. Deploy Frontend lên Vercel

```bash
cd frontend

# Login
vercel login

# Deploy
vercel --prod
```

### B. Deploy Backend lên Railway/Render

Backend với SQLite nên deploy lên:
- **Railway.app** (Miễn phí $5/tháng credit)
- **Render.com** (Miễn phí nhưng chậm)
- **Fly.io** (Miễn phí với giới hạn)

#### Deploy lên Railway:

```bash
# Cài Railway CLI
npm install -g @railway/cli

# Login
railway login

# Init project
cd backend
railway init

# Deploy
railway up
```

### C. Cập nhật Frontend để gọi Backend URL

Sau khi deploy backend, cập nhật file `frontend/src/services/api.js`:

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-backend-url.railway.app/api'
  : '/api';
```

## Option 3: Deploy All-in-One lên VPS

Nếu muốn đơn giản nhất, deploy lên VPS:
- **DigitalOcean** ($4/tháng)
- **Vultr** ($2.5/tháng)
- **Linode** ($5/tháng)

```bash
# Build frontend
cd frontend
npm run build

# Copy build vào backend
cp -r dist ../backend/public

# Deploy backend + frontend cùng nhau
cd ../backend
# Upload lên VPS và chạy
npm start
```

## 🌐 Biến môi trường

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend-url.com/api
```

### Backend (.env)
```
PORT=3001
DATABASE_URL=postgresql://user:password@host:5432/dbname
NODE_ENV=production
```

## 📝 Checklist trước khi deploy

- [ ] Database đã được setup (Postgres/Supabase/Turso)
- [ ] Environment variables đã được config
- [ ] Frontend build thành công
- [ ] Backend API hoạt động tốt
- [ ] CORS đã được config đúng
- [ ] Database migrations đã chạy

## 🔧 Troubleshooting

### Lỗi CORS
Thêm vào backend/src/server.js:
```javascript
app.use(cors({
  origin: ['https://your-frontend.vercel.app'],
  credentials: true
}));
```

### Lỗi Database Connection
Kiểm tra DATABASE_URL trong environment variables

### Lỗi Build
Chạy `npm run build` locally trước để kiểm tra
