# 🚀 Panduan Upload ke GitHub - Sekeluarga

Repository: https://github.com/WeRavens/Sekeluarga.git

## 📥 Step 1: Install Git (Jika Belum Ada)

### Download & Install Git:
1. Download Git dari: https://git-scm.com/download/win
2. Install dengan setting default (Next, Next, Finish)
3. Restart PowerShell/Terminal
4. Verify: `git --version`

---

## 🔧 Step 2: Konfigurasi Git (Pertama Kali)

```bash
# Set username
git config --global user.name "Your Name"

# Set email (gunakan email GitHub Anda)
git config --global user.email "your-email@example.com"

# Verify
git config --list
```

---

## 📤 Step 3: Upload ke GitHub

### A. Initialize Git Repository

```bash
# Masuk ke folder project
cd c:\Users\newde\Downloads\famgram

# Initialize Git
git init

# Add remote repository
git remote add origin https://github.com/WeRavens/Sekeluarga.git
```

### B. Check File yang Akan Di-Upload

```bash
# Lihat status
git status

# ⚠️ PENTING: Pastikan .env.local TIDAK muncul di list!
# Jika muncul, STOP dan check .gitignore
```

### C. Add & Commit Files

```bash
# Add semua file (kecuali yang di .gitignore)
git add .

# Commit dengan message
git commit -m "Initial commit - Sekeluarga PWA app"
```

### D. Push ke GitHub

```bash
# Push ke branch main
git push -u origin main

# Atau jika branch default adalah master:
git push -u origin master
```

---

## 🔐 Authentication GitHub

Saat push pertama kali, Anda akan diminta login:

### Option 1: GitHub CLI (Recommended)
```bash
# Install GitHub CLI
winget install GitHub.cli

# Login
gh auth login

# Pilih:
# - GitHub.com
# - HTTPS
# - Login with a web browser
```

### Option 2: Personal Access Token
1. Buka: https://github.com/settings/tokens
2. Generate new token (classic)
3. Pilih scope: `repo` (full control)
4. Copy token
5. Saat diminta password, paste token (bukan password GitHub!)

### Option 3: GitHub Desktop (Paling Mudah)
1. Download: https://desktop.github.com/
2. Install & login
3. Add repository: `c:\Users\newde\Downloads\famgram`
4. Commit & Push lewat GUI

---

## ✅ Checklist Sebelum Push

- [ ] Git sudah terinstall (`git --version`)
- [ ] Git config sudah di-set (username & email)
- [ ] Repository sudah di-init (`git init`)
- [ ] Remote sudah di-add (`git remote -v`)
- [ ] File `.env.local` **TIDAK** ada di `git status`
- [ ] File `node_modules/` **TIDAK** ada di `git status`
- [ ] File `.gitignore` sudah di-commit
- [ ] Ready to push!

---

## 🎯 Quick Commands (Copy-Paste)

```bash
# 1. Masuk ke folder
cd c:\Users\newde\Downloads\famgram

# 2. Init Git
git init

# 3. Add remote
git remote add origin https://github.com/WeRavens/Sekeluarga.git

# 4. Check status (PASTIKAN .env.local TIDAK ada!)
git status

# 5. Add files
git add .

# 6. Commit
git commit -m "Initial commit - Sekeluarga PWA app"

# 7. Push
git push -u origin main
```

---

## 🔄 Update Setelah Push Pertama

Untuk update selanjutnya:

```bash
# 1. Check perubahan
git status

# 2. Add perubahan
git add .

# 3. Commit
git commit -m "Update: deskripsi perubahan"

# 4. Push
git push
```

---

## 🆘 Troubleshooting

### Error: "fatal: not a git repository"
```bash
git init
```

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/WeRavens/Sekeluarga.git
```

### Error: "failed to push some refs"
```bash
# Pull dulu jika ada perubahan di GitHub
git pull origin main --allow-unrelated-histories

# Lalu push lagi
git push -u origin main
```

### Accidentally committed .env.local
```bash
# Remove from Git (tapi tetap di local)
git rm --cached .env.local

# Commit removal
git commit -m "Remove .env.local from Git"

# Push
git push
```

---

## 📱 Setelah Upload ke GitHub

### Deploy ke Vercel (Recommended):

1. **Buka:** https://vercel.com
2. **Import:** GitHub repository
3. **Configure:**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables:**
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`
5. **Deploy!**

### Deploy ke Netlify:

1. **Buka:** https://netlify.com
2. **Import:** GitHub repository
3. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Environment variables:** Same as Vercel
5. **Deploy!**

---

## 🎉 Done!

Setelah push sukses:
- ✅ Code tersimpan aman di GitHub
- ✅ Bisa di-clone di komputer lain
- ✅ Bisa di-deploy ke hosting
- ✅ Bisa kolaborasi dengan tim
- ✅ Version control aktif

---

**Repository:** https://github.com/WeRavens/Sekeluarga.git

**Next Steps:**
1. Install Git (jika belum)
2. Run commands di atas
3. Push ke GitHub
4. Deploy ke Vercel/Netlify
5. Test PWA di mobile!

Good luck! 🚀
