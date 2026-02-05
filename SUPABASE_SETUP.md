# 🔧 Setup Supabase untuk Sekeluarga

## ⚠️ PENTING - Ikuti Langkah Ini Agar Aplikasi Berfungsi!

Jika Anda mengalami error:
- ❌ "Failed to share post"
- ❌ User baru tidak muncul di admin dashboard
- ❌ Upload foto gagal

**Solusi:** Setup Supabase dengan benar mengikuti panduan ini.

---

## 📋 Checklist Setup Supabase

- [ ] 1. Buat project Supabase
- [ ] 2. Run SQL Schema
- [ ] 3. Buat Storage Bucket
- [ ] 4. Setup RLS Policies
- [ ] 5. Test koneksi

---

## 🚀 Step 1: Buat Project Supabase

1. Buka: https://supabase.com
2. Login/Sign up (gratis)
3. Klik **"New Project"**
4. Isi:
   - **Name:** Sekeluarga
   - **Database Password:** (buat password kuat, simpan!)
   - **Region:** Southeast Asia (Singapore) - terdekat dengan Indonesia
5. Klik **"Create new project"**
6. Tunggu ~2 menit sampai project ready

---

## 🗄️ Step 2: Run SQL Schema

### A. Buka SQL Editor

1. Di dashboard Supabase, klik **"SQL Editor"** di sidebar kiri
2. Klik **"New query"**

### B. Copy & Paste SQL Schema

Copy **SEMUA** isi file `supabase_schema.sql` dan paste ke SQL Editor.

**File: `supabase_schema.sql`**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT, -- For demo purposes only
  fullName TEXT NOT NULL,
  avatarUrl TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user',
  followers TEXT[] DEFAULT '{}',
  following TEXT[] DEFAULT '{}',
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  imageUrl TEXT NOT NULL,
  caption TEXT,
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  postId TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

-- Post likes table
CREATE TABLE IF NOT EXISTS post_likes (
  postId TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  PRIMARY KEY (postId, userId)
);

-- Insert seed data (default users)
INSERT INTO users (id, username, password, fullName, avatarUrl, bio, role) VALUES
  ('admin', 'admin', 'adminpassword', 'Administrator', 'https://ui-avatars.com/api/?name=Admin&background=000000&color=ffffff', 'System Administrator', 'admin'),
  ('u1', 'mom', 'password', 'Ibu', 'https://ui-avatars.com/api/?name=Ibu&background=e91e63&color=ffffff', 'Ibu dari keluarga ini ❤️', 'user'),
  ('u2', 'dad', 'password', 'Ayah', 'https://ui-avatars.com/api/?name=Ayah&background=2196f3&color=ffffff', 'Kepala keluarga 👨‍👩‍👧‍👦', 'user'),
  ('u3', 'sister', 'password', 'Kakak', 'https://ui-avatars.com/api/?name=Kakak&background=9c27b0&color=ffffff', 'Anak pertama 🎀', 'user'),
  ('u4', 'brother', 'password', 'Adik', 'https://ui-avatars.com/api/?name=Adik&background=ff9800&color=ffffff', 'Anak kedua ⚽', 'user')
ON CONFLICT (id) DO NOTHING;

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can restrict later)
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on posts" ON posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on comments" ON comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on post_likes" ON post_likes FOR ALL USING (true) WITH CHECK (true);
```

### C. Run SQL

1. Klik **"Run"** (atau tekan Ctrl+Enter)
2. Tunggu sampai muncul **"Success"**
3. ✅ Database tables sudah dibuat!

---

## 📦 Step 3: Buat Storage Bucket untuk Upload Foto

### A. Buka Storage

1. Di sidebar kiri, klik **"Storage"**
2. Klik **"Create a new bucket"**

### B. Konfigurasi Bucket

1. **Name:** `images`
2. **Public bucket:** ✅ **CENTANG** (penting!)
3. **File size limit:** 50 MB (default)
4. **Allowed MIME types:** Leave empty (allow all)
5. Klik **"Create bucket"**

### C. Setup Storage Policies

1. Klik bucket **"images"** yang baru dibuat
2. Klik tab **"Policies"**
3. Klik **"New Policy"**
4. Pilih template: **"Allow public access"**
5. Atau buat manual:

```sql
-- Policy untuk upload (INSERT)
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images');

-- Policy untuk read (SELECT)
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Policy untuk delete (DELETE)
CREATE POLICY "Allow public deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'images');
```

6. Klik **"Review"** → **"Save policy"**

---

## 🔑 Step 4: Copy API Credentials

1. Di sidebar kiri, klik **"Settings"** (icon gear)
2. Klik **"API"**
3. Copy **2 values** ini:

### **Project URL:**
```
https://xxxxxxxxxxxxx.supabase.co
```

### **anon/public key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Paste ke file **`.env.local`**:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

5. **Save** file `.env.local`
6. **Restart** dev server: `npm run dev`

---

## ✅ Step 5: Test Koneksi

### A. Test di Browser Console

1. Buka aplikasi: http://localhost:3000
2. Buka DevTools (F12)
3. Paste di Console:

```javascript
// Test Supabase connection
const { createClient } = supabase;
const client = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_ANON_KEY'
);

// Test query
client.from('users').select('*').then(console.log);
```

4. Jika berhasil, akan muncul data users

### B. Test Signup User Baru

1. Logout dari aplikasi
2. Klik **"Sign up"**
3. Buat user baru:
   - Username: `testuser`
   - Full Name: `Test User`
   - Password: `password123`
4. Klik **"Sign Up"**
5. Login dengan user baru
6. Coba upload foto

### C. Verify di Supabase Dashboard

1. Buka **"Table Editor"** di Supabase
2. Klik table **"users"**
3. User baru (`testuser`) harus muncul di list!

### D. Test Upload Foto

1. Login dengan user baru
2. Klik **"Create"** (icon +)
3. Upload foto
4. Tambahkan caption
5. Klik **"Share"**
6. Jika berhasil, foto muncul di feed!

### E. Verify di Storage

1. Buka **"Storage"** → **"images"** di Supabase
2. File foto yang di-upload harus muncul!

---

## 🐛 Troubleshooting

### ❌ Error: "Failed to share post"

**Penyebab:**
- Storage bucket `images` belum dibuat
- Storage policies belum di-setup
- Bucket tidak public

**Solusi:**
1. Check bucket `images` exists di Storage
2. Check bucket is **Public**
3. Check storage policies sudah di-setup
4. Restart dev server

### ❌ User baru tidak muncul di Admin Dashboard

**Penyebab:**
- SQL schema belum di-run
- Table `users` belum dibuat
- RLS policies terlalu strict

**Solusi:**
1. Run SQL schema di Step 2
2. Check table `users` exists di Table Editor
3. Check RLS policies: "Allow all on users"

### ❌ Error: "relation 'users' does not exist"

**Penyebab:**
- SQL schema belum di-run

**Solusi:**
1. Buka SQL Editor
2. Run SQL schema dari `supabase_schema.sql`
3. Restart dev server

### ❌ Error: "Invalid API key"

**Penyebab:**
- `.env.local` salah atau belum di-set
- API key tidak valid

**Solusi:**
1. Check `.env.local` file exists
2. Copy ulang API credentials dari Supabase Settings → API
3. Restart dev server: `Ctrl+C` → `npm run dev`

---

## 📊 Verify Setup Lengkap

Checklist ini harus **SEMUA** ✅:

- [ ] Project Supabase sudah dibuat
- [ ] SQL schema sudah di-run (table users, posts, comments, post_likes exists)
- [ ] Storage bucket `images` sudah dibuat
- [ ] Bucket `images` adalah **Public**
- [ ] Storage policies sudah di-setup
- [ ] File `.env.local` sudah diisi dengan credentials
- [ ] Dev server sudah di-restart
- [ ] Test signup user baru → **BERHASIL**
- [ ] User baru muncul di Table Editor → **BERHASIL**
- [ ] Test upload foto → **BERHASIL**
- [ ] Foto muncul di Storage → **BERHASIL**

---

## 🎯 Quick Fix Commands

Jika masih error, coba:

```bash
# 1. Stop dev server
Ctrl+C

# 2. Clear cache
rm -rf node_modules/.vite

# 3. Restart
npm run dev
```

---

## 📞 Masih Error?

1. Check browser console (F12) untuk error messages
2. Check Supabase logs: Dashboard → Logs
3. Verify semua step di atas sudah dilakukan
4. Pastikan `.env.local` tidak ter-commit ke Git (harus di .gitignore)

---

**Setelah setup ini, aplikasi akan:**
- ✅ Signup user baru ke database Supabase
- ✅ User muncul di admin dashboard
- ✅ Upload foto berhasil
- ✅ Semua data persistent (tidak hilang saat refresh)

**Good luck! 🚀**
