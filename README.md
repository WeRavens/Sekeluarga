# 📱 Sekeluarga - Family Social Media PWA

> Aplikasi media sosial untuk berbagi momen bersama keluarga tercinta

[![PWA](https://img.shields.io/badge/PWA-Enabled-blue)](https://web.dev/progressive-web-apps/)
[![React](https://img.shields.io/badge/React-19.2-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646cff)](https://vitejs.dev/)

## ✨ Features

- 📸 **Upload & Share Photos** - Berbagi momen keluarga dengan mudah
- 👥 **Follow System** - Follow anggota keluarga lain
- 💬 **Comments & Likes** - Interaksi dengan posting
- 👤 **User Profiles** - Profil personal dengan bio dan avatar
- 🌓 **Dark Mode** - Support light & dark theme
- 📱 **PWA** - Install sebagai aplikasi native di mobile
- 🔒 **Secure** - Integrasi dengan Supabase untuk data persistence
- ⚡ **Fast** - Built with Vite untuk performa optimal

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm atau yarn
- Akun Supabase (gratis)

### Installation

1. **Clone repository**
   ```bash
   git clone https://github.com/yourusername/sekeluarga.git
   cd sekeluarga
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   # Copy template
   cp .env.example .env.local
   
   # Edit .env.local dengan credentials Supabase Anda
   ```

4. **Setup Supabase Database**
   ```bash
   # Run SQL schema di Supabase SQL Editor
   # File: supabase_schema.sql
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   ```
   http://localhost:3000
   ```

## 🗄️ Database Setup

### Supabase Configuration

1. Buat project baru di [Supabase](https://supabase.com)
2. Buka SQL Editor
3. Copy & paste isi file `supabase_schema.sql`
4. Run SQL
5. Setup Storage bucket:
   - Buat bucket bernama `images`
   - Set public access
6. Copy credentials ke `.env.local`

## 📱 PWA Installation

### Android
1. Buka website di Chrome
2. Tap menu (⋮) → "Add to Home Screen"
3. Aplikasi terinstall!

### iOS
1. Buka website di Safari
2. Tap Share → "Add to Home Screen"
3. Aplikasi terinstall!

### Desktop
1. Buka di Chrome/Edge
2. Klik icon install di address bar
3. Aplikasi terinstall!

## 🏗️ Tech Stack

- **Frontend Framework:** React 19.2
- **Language:** TypeScript
- **Build Tool:** Vite 6.x
- **Styling:** Tailwind CSS (CDN)
- **Routing:** React Router DOM 7.x
- **Icons:** Lucide React
- **Backend:** Supabase
  - Database: PostgreSQL
  - Storage: Supabase Storage
  - Auth: (Future implementation)

## 📁 Project Structure

```
sekeluarga/
├── components/          # React components
│   ├── Layout.tsx      # Main layout with navigation
│   ├── PostCard.tsx    # Post display component
│   ├── Stories.tsx     # Stories carousel
│   └── Suggestions.tsx # User suggestions sidebar
├── pages/              # Page components
│   ├── Feed.tsx        # Main feed
│   ├── Upload.tsx      # Upload new post
│   ├── Profile.tsx     # User profile
│   ├── UserProfile.tsx # Other user's profile
│   ├── Login.tsx       # Login/Signup
│   └── AdminDashboard.tsx # Admin panel
├── context/            # React Context
│   ├── AuthContext.tsx # Authentication state
│   └── ThemeContext.tsx # Theme management
├── services/           # API services
│   ├── db.ts          # Supabase database
│   ├── storage.ts     # Local storage
│   └── supabaseClient.ts # Supabase client
├── public/             # Static assets
│   ├── manifest.json  # PWA manifest
│   ├── sw.js          # Service worker
│   └── logo-*.jpg     # App icons
└── types.ts           # TypeScript types
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Deployment
npm run deploy       # Deploy to hosting
```

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

### Netlify
1. Drag & drop folder `dist/`
2. Set environment variables
3. Deploy!

### GitHub Pages
```bash
npm install -D gh-pages
npm run deploy
```

**Important:** Set environment variables di dashboard hosting:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🔐 Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**⚠️ JANGAN commit `.env.local` ke Git!**

## 👥 Default Users

Untuk testing (setelah run SQL schema):

- **User:** mom / **Pass:** password
- **User:** dad / **Pass:** password  
- **Admin:** admin / **Pass:** adminpassword

## 📖 Documentation

- [PWA Guide](PWA_GUIDE.md) - Panduan lengkap PWA
- [GitHub Upload Guide](GITHUB_UPLOAD_GUIDE.md) - Cara upload ke GitHub dengan aman

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Hosting by [Supabase](https://supabase.com/)
- Built with [Vite](https://vitejs.dev/) & [React](https://react.dev/)

## 📞 Support

Jika ada pertanyaan atau masalah:
1. Check [PWA_GUIDE.md](PWA_GUIDE.md) untuk troubleshooting
2. Open an issue di GitHub
3. Contact: [your-email@example.com]

---

**Made with ❤️ for families**
