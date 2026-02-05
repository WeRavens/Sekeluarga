# 📱 Sekeluarga - Progressive Web App (PWA)

## ✅ Fitur PWA yang Sudah Diimplementasikan

### 1. **Installable App** 📲
Aplikasi ini sekarang bisa diinstall di perangkat mobile dan desktop seperti aplikasi native!

### 2. **Manifest File** (`public/manifest.json`)
- Nama aplikasi: **Sekeluarga**
- Deskripsi: Aplikasi media sosial untuk keluarga
- Icon: Logo custom Anda (logo.jpg)
- Display mode: Standalone (fullscreen seperti app native)
- Theme color: Hitam (#000000)

### 3. **Service Worker** (`public/sw.js`)
- Caching untuk offline functionality
- Faster loading dengan cache
- Auto-update cache

### 4. **PWA Meta Tags**
- Apple Touch Icon untuk iOS
- Theme color untuk Android
- Viewport optimization untuk mobile
- SEO-friendly meta tags

---

## 🚀 Cara Install di Mobile

### **Android (Chrome/Edge)**
1. Buka website di Chrome
2. Tap menu (⋮) di kanan atas
3. Pilih **"Add to Home Screen"** atau **"Install app"**
4. Konfirmasi install
5. Icon "Sekeluarga" akan muncul di home screen!

### **iOS (Safari)**
1. Buka website di Safari
2. Tap tombol Share (kotak dengan panah ke atas)
3. Scroll dan pilih **"Add to Home Screen"**
4. Edit nama jika perlu, tap **"Add"**
5. Icon "Sekeluarga" akan muncul di home screen!

### **Desktop (Chrome/Edge)**
1. Buka website di browser
2. Lihat icon install (⊕) di address bar
3. Klik dan pilih **"Install"**
4. App akan terbuka di window terpisah

---

## 📦 Struktur File PWA

```
famgram/
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js              # Service worker
│   ├── logo-192.jpg       # Icon 192x192
│   └── logo-512.jpg       # Icon 512x512
├── index.html             # Updated dengan PWA meta tags
└── vite.config.ts         # Config untuk public folder
```

---

## 🎨 Perubahan Branding

### **FamGram → Sekeluarga**
✅ Semua referensi "FamGram" diganti menjadi "Sekeluarga"
✅ Logo custom (logo.jpg) digunakan di semua tempat
✅ Tagline: "Berbagi momen bersama keluarga"

### **Halaman Login**
✅ Hapus tombol "Log in with Facebook (Demo)"
✅ Hapus "Mock Credentials for Demo"
✅ Logo Sekeluarga ditampilkan
✅ UI lebih clean dan professional

---

## 🌐 Deploy untuk PWA

### **Langkah Deploy:**

1. **Build Production**
   ```bash
   npm run build
   ```

2. **Deploy ke Hosting**
   - **Vercel**: `vercel --prod`
   - **Netlify**: Drag & drop folder `dist`
   - **GitHub Pages**: Push ke branch gh-pages
   - **Firebase Hosting**: `firebase deploy`

3. **HTTPS Wajib!**
   ⚠️ PWA hanya bekerja di HTTPS (atau localhost)
   - Semua platform hosting modern sudah auto-HTTPS

4. **Test PWA**
   - Buka di mobile browser
   - Cek apakah muncul prompt "Add to Home Screen"
   - Install dan test offline functionality

---

## 🔧 Troubleshooting PWA

### **Prompt Install Tidak Muncul?**
1. Pastikan sudah di HTTPS
2. Clear browser cache
3. Buka di Incognito/Private mode
4. Pastikan manifest.json accessible di `/manifest.json`

### **Icon Tidak Muncul?**
1. Check file logo ada di `/public/logo-192.jpg` dan `/public/logo-512.jpg`
2. Rebuild: `npm run build`
3. Clear cache dan reload

### **Service Worker Error?**
1. Buka DevTools → Application → Service Workers
2. Unregister service worker lama
3. Reload page

---

## 📱 Testing PWA

### **Chrome DevTools**
1. F12 → Application tab
2. Check:
   - ✅ Manifest
   - ✅ Service Workers
   - ✅ Icons
3. Lighthouse audit untuk PWA score

### **Mobile Testing**
1. Deploy ke hosting
2. Buka di mobile browser
3. Test install flow
4. Test offline mode (airplane mode)

---

## 🎯 Checklist PWA

- ✅ manifest.json configured
- ✅ Service worker registered
- ✅ Icons (192x192, 512x512)
- ✅ HTTPS ready
- ✅ Meta tags for mobile
- ✅ Offline functionality
- ✅ Installable prompt
- ✅ Standalone display mode
- ✅ Theme color set
- ✅ Start URL configured

---

## 💡 Tips

1. **Logo Optimization**: Gunakan PNG/JPG dengan ukuran tepat (192x192, 512x512)
2. **Cache Strategy**: Edit `sw.js` untuk custom caching
3. **Update Handling**: Service worker auto-update saat deploy baru
4. **Analytics**: Tambahkan tracking untuk install events
5. **Push Notifications**: Bisa ditambahkan nanti via service worker

---

## 🆘 Support

Jika ada masalah:
1. Check browser console untuk errors
2. Verify manifest.json di `/manifest.json`
3. Test di multiple browsers
4. Ensure HTTPS saat production

**Selamat! Aplikasi Sekeluarga sekarang adalah PWA yang bisa diinstall! 🎉**
