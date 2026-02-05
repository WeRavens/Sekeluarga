# 🚀 Panduan Upload ke GitHub

## ❌ JANGAN Upload (Sudah di .gitignore):

### 1. **File Sensitif (BAHAYA!)**
- ❌ `.env.local` - **BERISI API KEY SUPABASE!**
- ❌ `.env` 
- ❌ `.env.production`
- ❌ Semua file `*.local`

### 2. **Folder Build & Dependencies**
- ❌ `node_modules/` - Terlalu besar (ratusan MB)
- ❌ `dist/` - Hasil build (akan di-generate otomatis)
- ❌ `dist-ssr/`

### 3. **File Log & Temporary**
- ❌ `*.log`
- ❌ `logs/`

### 4. **Editor Config (Optional)**
- ❌ `.vscode/` (kecuali extensions.json)
- ❌ `.idea/`

---

## ✅ HARUS Upload:

### **Source Code**
- ✅ `*.tsx` - Semua component React
- ✅ `*.ts` - TypeScript files
- ✅ `*.css` - Styling
- ✅ `*.html` - HTML files

### **Config Files**
- ✅ `package.json` - Dependencies list
- ✅ `package-lock.json` - Lock file
- ✅ `tsconfig.json` - TypeScript config
- ✅ `vite.config.ts` - Vite config
- ✅ `.gitignore` - Git ignore rules

### **PWA Assets**
- ✅ `public/` folder:
  - ✅ `manifest.json`
  - ✅ `sw.js`
  - ✅ `logo-192.jpg`
  - ✅ `logo-512.jpg`

### **Documentation**
- ✅ `README.md`
- ✅ `PWA_GUIDE.md`

### **Database Schema (Optional)**
- ✅ `supabase_schema.sql` - Untuk setup database
  - ⚠️ **PASTIKAN tidak ada password/API key di file ini!**

---

## 🔐 Cara Aman Handle Environment Variables:

### **1. Buat file `.env.example`** (Template untuk orang lain)
```bash
# .env.example (UPLOAD ini ke GitHub)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### **2. File `.env.local` JANGAN di-upload!**
```bash
# .env.local (JANGAN UPLOAD!)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 Checklist Sebelum Push ke GitHub:

```bash
# 1. Check .gitignore sudah benar
cat .gitignore

# 2. Check file apa yang akan di-commit
git status

# 3. PASTIKAN .env.local TIDAK muncul di list!
# Jika muncul, JANGAN commit!

# 4. Add files
git add .

# 5. Commit
git commit -m "Initial commit - Sekeluarga PWA"

# 6. Push
git push origin main
```

---

## ⚠️ PENTING - Double Check:

### **Sebelum `git push`, pastikan:**
1. ✅ File `.env.local` **TIDAK** ada di `git status`
2. ✅ Folder `node_modules/` **TIDAK** ada di `git status`
3. ✅ Folder `dist/` **TIDAK** ada di `git status`
4. ✅ File `.gitignore` sudah di-commit

### **Jika sudah terlanjur commit file sensitif:**
```bash
# Hapus dari Git history (HATI-HATI!)
git rm --cached .env.local
git commit -m "Remove sensitive file"

# Atau reset commit terakhir
git reset HEAD~1
```

---

## 🚀 Workflow Recommended:

### **Setup Awal:**
```bash
# 1. Init Git (jika belum)
git init

# 2. Add remote
git remote add origin https://github.com/username/sekeluarga.git

# 3. Add semua file (kecuali yang di .gitignore)
git add .

# 4. Commit
git commit -m "Initial commit - Sekeluarga PWA app"

# 5. Push
git push -u origin main
```

### **Deploy ke Vercel/Netlify:**
1. Connect repository GitHub
2. Set environment variables di dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy otomatis!

---

## 📁 Struktur yang Akan Di-Upload:

```
sekeluarga/
├── .gitignore          ✅ Upload
├── package.json        ✅ Upload
├── vite.config.ts      ✅ Upload
├── tsconfig.json       ✅ Upload
├── index.html          ✅ Upload
├── index.tsx           ✅ Upload
├── README.md           ✅ Upload
├── PWA_GUIDE.md        ✅ Upload
├── .env.example        ✅ Upload (template)
├── .env.local          ❌ JANGAN!
├── node_modules/       ❌ JANGAN!
├── dist/               ❌ JANGAN!
├── public/             ✅ Upload (semua)
│   ├── manifest.json
│   ├── sw.js
│   ├── logo-192.jpg
│   └── logo-512.jpg
├── components/         ✅ Upload (semua .tsx)
├── pages/              ✅ Upload (semua .tsx)
├── context/            ✅ Upload (semua .tsx)
├── services/           ✅ Upload (semua .ts)
└── types.ts            ✅ Upload
```

---

## 💡 Tips Keamanan:

1. **Jangan pernah commit API keys!**
2. **Gunakan `.env.example` untuk template**
3. **Set environment variables di hosting platform**
4. **Review `git status` sebelum commit**
5. **Gunakan `.gitignore` dengan benar**

---

**Kesimpulan:** Upload **SEMUA** kecuali yang ada di `.gitignore`! 🎯
